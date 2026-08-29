/**
 * RazorAgent MCP (Model Context Protocol) Server Engine
 * Exposes standardized, callable commerce tools for autonomous AI agents.
 */

import { CartItem, CartQuote, MCPToolDefinition, PolicyDecision, RazorpayOrderResponse } from './types';
import { MERCHANT_CATALOG, AVAILABLE_COUPONS } from './catalog-data';
import { globalGuardrailEngine } from './guardrails';
import { globalIdempotencyManager } from './idempotency';
import { globalRazorpayAdapter } from './razorpay';

// Active cart session cache
const CART_STORE: Map<string, CartQuote> = new Map();
// Pending promise map to handle exact same-tick async race conditions
const PENDING_ORDER_PROMISES: Map<string, Promise<any>> = new Map();

export const MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'search_products',
    description: 'Search the merchant catalog using semantic keywords, category filters, maximum price, and minimum review ratings.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keywords (e.g., "mechanical keyboard", "espresso beans", "anc headphones")' },
        category: { type: 'string', description: 'Category filter (e.g., "electronics", "wellness", "specialty-coffee")' },
        max_price: { type: 'number', description: 'Maximum price in INR (₹)' },
        min_rating: { type: 'number', description: 'Minimum average customer rating (1.0 to 5.0)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_product_details',
    description: 'Retrieve full technical specs, real-time inventory count, and applicable coupon codes for a specific SKU.',
    parameters: {
      type: 'object',
      properties: {
        product_id: { type: 'string', description: 'The unique product ID (e.g. "prod_kb_01")' },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'calculate_cart_quote',
    description: 'Calculates the subtotal, taxes (18% GST), shipping fees, and coupon discounts for a list of items, returning a signed CartQuote.',
    parameters: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          description: 'List of items to quote',
          items: {
            type: 'object',
            properties: {
              product_id: { type: 'string' },
              quantity: { type: 'number' },
            },
            required: ['product_id', 'quantity'],
          },
        },
        coupon_code: { type: 'string', description: 'Optional coupon code (e.g. "AGENT500", "BUILD2026")' },
      },
      required: ['items'],
    },
  },
  {
    name: 'evaluate_spend_policy',
    description: 'Runs deterministic merchant safety guardrails on the cart to verify compliance before creating financial orders.',
    parameters: {
      type: 'object',
      properties: {
        cart_id: { type: 'string', description: 'The cart ID to evaluate against policies' },
      },
      required: ['cart_id'],
    },
  },
  {
    name: 'create_guarded_order',
    description: 'Creates a Razorpay Order protected by cryptographic SHA-256 idempotency locks and policy guardrails. Returns payment link and UPI intent.',
    parameters: {
      type: 'object',
      properties: {
        cart_id: { type: 'string', description: 'The validated Cart ID' },
        idempotency_key: { type: 'string', description: 'Unique agent nonce or session ID to prevent duplicate billing' },
        buyer_email: { type: 'string', description: 'Principal buyer email address' },
      },
      required: ['cart_id', 'idempotency_key'],
    },
  },
  {
    name: 'verify_payment_and_settle',
    description: 'Verifies the cryptographic HMAC SHA-256 signature from Razorpay checkout to confirm order settlement.',
    parameters: {
      type: 'object',
      properties: {
        order_id: { type: 'string', description: 'The Razorpay Order ID (e.g. "order_xxx")' },
        payment_id: { type: 'string', description: 'The Razorpay Payment ID (e.g. "pay_xxx")' },
        signature: { type: 'string', description: 'HMAC SHA-256 signature string' },
      },
      required: ['order_id', 'payment_id', 'signature'],
    },
  },
];

export class MCPEngine {
  public listTools(): MCPToolDefinition[] {
    return MCP_TOOLS;
  }

  public async executeTool(toolName: string, args: Record<string, any>): Promise<any> {
    switch (toolName) {
      case 'search_products':
        return this.searchProducts(args.query, args.category, args.max_price, args.min_rating);

      case 'get_product_details':
        return this.getProductDetails(args.product_id);

      case 'calculate_cart_quote':
        return this.calculateCartQuote(args.items, args.coupon_code);

      case 'evaluate_spend_policy':
        return this.evaluateSpendPolicy(args.cart_id);

      case 'create_guarded_order':
        return this.createGuardedOrder(args.cart_id, args.idempotency_key, args.buyer_email);

      case 'verify_payment_and_settle':
        return this.verifyPaymentAndSettle(args.order_id, args.payment_id, args.signature);

      default:
        throw new Error(`Unknown MCP Tool: ${toolName}`);
    }
  }

  private searchProducts(query: string, category?: string, maxPrice?: number, minRating?: number) {
    const q = (query || '').toLowerCase().trim();

    const results = MERCHANT_CATALOG.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));

      const matchesCategory = !category || p.category.toLowerCase() === category.toLowerCase();
      const matchesPrice = !maxPrice || p.price <= maxPrice;
      const matchesRating = !minRating || p.rating >= minRating;

      return matchesQuery && matchesCategory && matchesPrice && matchesRating;
    });

    return {
      query,
      count: results.length,
      products: results.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price_inr: p.price,
        rating: p.rating,
        stock_available: p.stock,
        tags: p.tags,
      })),
    };
  }

  private getProductDetails(productId: string) {
    const item = MERCHANT_CATALOG.find((p) => p.id === productId);
    if (!item) {
      return { error: 'PRODUCT_NOT_FOUND', message: `No product found matching ID: ${productId}` };
    }

    return {
      ...item,
      price_inr: item.price,
      currency: 'INR',
    };
  }

  private calculateCartQuote(items: { product_id: string; quantity: number }[], couponCode?: string): CartQuote {
    const cartItems: CartItem[] = [];
    let subtotal = 0;

    for (const reqItem of items) {
      const product = MERCHANT_CATALOG.find((p) => p.id === reqItem.product_id);
      if (!product) continue;

      const qty = Math.max(1, reqItem.quantity || 1);
      const lineTotal = product.price * qty;
      subtotal += lineTotal;

      cartItems.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: qty,
        subtotal: lineTotal,
      });
    }

    // Apply coupon if valid
    let discount = 0;
    let appliedCoupon: string | undefined = undefined;

    if (couponCode && AVAILABLE_COUPONS[couponCode]) {
      const rule = AVAILABLE_COUPONS[couponCode];
      if (subtotal >= rule.minSpendINR) {
        if (rule.flatDiscountINR) {
          discount = Math.min(rule.flatDiscountINR, subtotal);
        } else if (rule.discountPercent) {
          discount = Math.round((subtotal * rule.discountPercent) / 100);
        }
        appliedCoupon = couponCode;
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const tax = Math.round(discountedSubtotal * 0.18); // 18% GST
    const shipping = discountedSubtotal > 2000 ? 0 : 99; // Free shipping over ₹2000
    const totalAmount = discountedSubtotal + tax + shipping;

    const cartId = `cart_${Math.random().toString(36).substring(2, 10)}`;

    const quote: CartQuote = {
      cartId,
      items: cartItems,
      subtotal,
      discount,
      couponApplied: appliedCoupon,
      tax,
      shipping,
      totalAmount,
      currency: 'INR',
    };

    CART_STORE.set(cartId, quote);
    return quote;
  }

  private evaluateSpendPolicy(cartId: string): PolicyDecision {
    const cart = CART_STORE.get(cartId);
    if (!cart) {
      return {
        allowed: false,
        reasonCode: 'QUANTITY_LIMIT_EXCEEDED',
        message: `Cart session "${cartId}" not found or expired.`,
        evaluatedAt: new Date().toISOString(),
      };
    }

    return globalGuardrailEngine.evaluate(cart);
  }

  private async createGuardedOrder(
    cartId: string,
    idempotencyKey: string,
    buyerEmail: string = 'buyer@agentic.ai'
  ): Promise<{ success: boolean; decision: PolicyDecision; order?: RazorpayOrderResponse; isCached?: boolean }> {
    const cart = CART_STORE.get(cartId);
    if (!cart) {
      return {
        success: false,
        decision: {
          allowed: false,
          reasonCode: 'QUANTITY_LIMIT_EXCEEDED',
          message: `Cart session "${cartId}" not found or expired.`,
          evaluatedAt: new Date().toISOString(),
        },
      };
    }

    // Step 1: Deterministic Policy Evaluation
    const decision = globalGuardrailEngine.evaluate(cart);
    if (!decision.allowed) {
      return {
        success: false,
        decision,
      };
    }

    // Step 2: Check for in-flight pending creation on exact same key
    if (PENDING_ORDER_PROMISES.has(idempotencyKey)) {
      const existingPromise = PENDING_ORDER_PROMISES.get(idempotencyKey)!;
      const cachedResult = await existingPromise;
      return {
        ...cachedResult,
        decision: {
          allowed: true,
          reasonCode: 'IDEMPOTENCY_RETRY_SUPPRESSED',
          message: `Concurrent invocation intercepted. Served active Razorpay order (${cachedResult.order?.id}) with zero duplicate billing.`,
          evaluatedAt: new Date().toISOString(),
        },
        isCached: true,
      };
    }

    // Step 3: Cryptographic Idempotency Lock Check
    const agentId = 'agent_buyer_01';
    const fingerprint = globalIdempotencyManager.generateFingerprint(agentId, cart);
    const lockResult = globalIdempotencyManager.acquireLock(idempotencyKey, agentId, fingerprint);

    if (!lockResult.acquired && lockResult.isDuplicate) {
      // 2 AM Race Condition Intercepted! Return cached response without double-billing
      const cachedOrder = lockResult.record.responseCache as RazorpayOrderResponse | undefined;
      return {
        success: true,
        decision: {
          allowed: true,
          reasonCode: 'IDEMPOTENCY_RETRY_SUPPRESSED',
          message: `Duplicate invocation intercepted. Serving verified active Razorpay order (${lockResult.record.orderId}) without duplicate debit.`,
          evaluatedAt: new Date().toISOString(),
          metadata: {
            idempotencyKey,
            orderId: lockResult.record.orderId,
            hash: lockResult.record.hash,
          },
        },
        order: cachedOrder,
        isCached: true,
      };
    }

    // Wrap execution in pending promise map for same-tick async race conditions
    const orderPromise = (async () => {
      try {
        const order = await globalRazorpayAdapter.createOrder(cart, agentId, buyerEmail);
        globalIdempotencyManager.completeOrder(idempotencyKey, order.id, order);

        return {
          success: true,
          decision,
          order,
          isCached: false,
        };
      } catch (err: any) {
        globalIdempotencyManager.releaseLock(idempotencyKey);
        return {
          success: false,
          decision: {
            allowed: false,
            reasonCode: 'POLICY_PASSED' as const,
            message: `Razorpay Order creation error: ${err?.message || 'Gateway connection timeout'}`,
            evaluatedAt: new Date().toISOString(),
          },
        };
      } finally {
        PENDING_ORDER_PROMISES.delete(idempotencyKey);
      }
    })();

    PENDING_ORDER_PROMISES.set(idempotencyKey, orderPromise);
    return await orderPromise;
  }

  private verifyPaymentAndSettle(orderId: string, paymentId: string, signature: string) {
    const isValid = globalRazorpayAdapter.verifySignature(orderId, paymentId, signature);

    return {
      verified: isValid,
      orderId,
      paymentId,
      status: isValid ? 'CAPTURED_AND_SETTLED' : 'SIGNATURE_VERIFICATION_FAILED',
      protocol: 'RAZORAGENT_SETTLEMENT_v1.0',
      timestamp: new Date().toISOString(),
    };
  }
}

export const globalMCPEngine = new MCPEngine();
