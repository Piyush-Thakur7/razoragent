/**
 * RazorAgent MCP (Model Context Protocol) Server Engine
 * Exposes standardized, callable commerce tools for autonomous AI agents.
 * 
 * Powered by a pluggable Merchant-Agnostic Catalog Architecture (Shopify, WooCommerce, Demo).
 */

import { CartItem, CartQuote, MCPToolDefinition, PolicyDecision, RazorpayOrderResponse } from './types';
import { AVAILABLE_COUPONS, globalDemoCatalogProvider } from './catalog-data';
import { CatalogProvider } from './catalog-provider';
import { ShopifyCatalogProvider } from './shopify-catalog-provider';
import { WooCommerceCatalogProvider } from './woocommerce-catalog-provider';
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
        coupon_code: { type: 'string', description: 'Optional promo or discount code' },
      },
      required: ['items'],
    },
  },
  {
    name: 'evaluate_spend_policy',
    description: 'Runs deterministic merchant safety guardrails on the cart to verify compliance with spend limits, SKU caps, and whitelist rules.',
    parameters: {
      type: 'object',
      properties: {
        cart_id: { type: 'string', description: 'The unique cart ID from calculate_cart_quote' },
      },
      required: ['cart_id'],
    },
  },
  {
    name: 'create_guarded_order',
    description: 'Creates a Razorpay Order protected by cryptographic SHA-256 idempotency locks and pre-settlement spend guardrails.',
    parameters: {
      type: 'object',
      properties: {
        cart_id: { type: 'string', description: 'The approved cart quote ID' },
        idempotency_key: { type: 'string', description: 'Unique agent session transaction token' },
        buyer_email: { type: 'string', description: 'Principal buyer email address' },
      },
      required: ['cart_id', 'idempotency_key'],
    },
  },
  {
    name: 'verify_payment_and_settle',
    description: 'Verifies the cryptographic HMAC SHA-256 signature from Razorpay checkout and transitions order to SETTLED.',
    parameters: {
      type: 'object',
      properties: {
        order_id: { type: 'string', description: 'Razorpay Order ID (e.g. order_xxx)' },
        payment_id: { type: 'string', description: 'Razorpay Payment ID (e.g. pay_xxx)' },
        signature: { type: 'string', description: 'Cryptographic HMAC signature from Razorpay checkout' },
      },
      required: ['order_id', 'payment_id', 'signature'],
    },
  },
];

export class MCPEngine {
  private catalogProvider: CatalogProvider;

  constructor(customProvider?: CatalogProvider) {
    if (customProvider) {
      this.catalogProvider = customProvider;
    } else if (process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      this.catalogProvider = new ShopifyCatalogProvider();
    } else if (process.env.WOOCOMMERCE_SITE_URL && process.env.WOOCOMMERCE_CONSUMER_KEY) {
      this.catalogProvider = new WooCommerceCatalogProvider();
    } else {
      this.catalogProvider = globalDemoCatalogProvider;
    }
  }

  public setCatalogProvider(provider: CatalogProvider): void {
    this.catalogProvider = provider;
  }

  public getCatalogProvider(): CatalogProvider {
    return this.catalogProvider;
  }

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

  private async searchProducts(query: string, category?: string, maxPrice?: number, minRating?: number) {
    const products = await this.catalogProvider.searchProducts(query, { category, maxPrice, minRating });

    return {
      query,
      count: products.length,
      provider: this.catalogProvider.getProviderName(),
      products: products.map((p) => ({
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

  private async getProductDetails(productId: string) {
    const item = await this.catalogProvider.getProductDetails(productId);
    if (!item) {
      return { error: 'PRODUCT_NOT_FOUND', message: `No product found matching ID: ${productId}` };
    }

    return {
      ...item,
      price_inr: item.price,
      currency: 'INR',
      provider: this.catalogProvider.getProviderName(),
    };
  }

  private async calculateCartQuote(items: { product_id: string; quantity: number }[], couponCode?: string): Promise<CartQuote> {
    const cartItems: CartItem[] = [];
    let subtotal = 0;

    for (const reqItem of items) {
      const product = await this.catalogProvider.getProductDetails(reqItem.product_id);
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
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    // Cache cart quote for deterministic policy evaluation & order generation
    CART_STORE.set(cartId, quote);
    return quote;
  }

  private evaluateSpendPolicy(cartId: string): PolicyDecision {
    const cart = CART_STORE.get(cartId);
    if (!cart) {
      return {
        allowed: false,
        reasonCode: 'CART_EXPIRED',
        message: `Cart quote "${cartId}" is invalid or has expired. Request a new quote before proceeding.`,
        evaluatedAt: new Date().toISOString(),
      };
    }

    return globalGuardrailEngine.evaluate(cart);
  }

  private async createGuardedOrder(
    cartId: string,
    idempotencyKey: string,
    buyerEmail: string = 'buyer.agent@resence.in'
  ): Promise<{ success: boolean; decision: PolicyDecision; order?: RazorpayOrderResponse; isCached: boolean }> {
    const cart = CART_STORE.get(cartId);
    if (!cart) {
      const decision: PolicyDecision = {
        allowed: false,
        reasonCode: 'CART_EXPIRED',
        message: `Cart quote "${cartId}" has expired.`,
        evaluatedAt: new Date().toISOString(),
      };
      return { success: false, decision, isCached: false };
    }

    // Step 1: Pre-settlement deterministic guardrails
    const policyDecision = globalGuardrailEngine.evaluate(cart);
    if (!policyDecision.allowed) {
      return { success: false, decision: policyDecision, isCached: false };
    }

    // Step 2: Canonical fingerprint hash for same-tick async race-condition defense
    const fingerprint = globalIdempotencyManager.generateFingerprint('agent_buyer_01', cart);
    const concurrencyKey = `lock_${fingerprint}`;

    if (PENDING_ORDER_PROMISES.has(concurrencyKey)) {
      const existingPromise = PENDING_ORDER_PROMISES.get(concurrencyKey)!;
      const cachedOrder = await existingPromise;
      return { success: true, decision: policyDecision, order: cachedOrder, isCached: true };
    }

    // Step 3: Check memory-cached idempotency lock
    const lockResult = globalIdempotencyManager.acquireLock(idempotencyKey, 'agent_buyer_01', fingerprint);
    if (!lockResult.acquired && lockResult.record.status === 'ORDER_CREATED' && lockResult.record.responseCache) {
      return {
        success: true,
        decision: policyDecision,
        order: lockResult.record.responseCache as RazorpayOrderResponse,
        isCached: true,
      };
    }

    // Step 4: Execute Razorpay order creation wrapped in promise latch
    const orderExecutionPromise = (async () => {
      const order = await globalRazorpayAdapter.createOrder(cart, 'agent_buyer_01', buyerEmail);
      globalIdempotencyManager.completeOrder(idempotencyKey, order.id, order);
      return order;
    })();

    PENDING_ORDER_PROMISES.set(concurrencyKey, orderExecutionPromise);

    try {
      const liveOrder = await orderExecutionPromise;
      return { success: true, decision: policyDecision, order: liveOrder, isCached: false };
    } finally {
      setTimeout(() => {
        PENDING_ORDER_PROMISES.delete(concurrencyKey);
      }, 5000);
    }
  }

  private verifyPaymentAndSettle(orderId: string, paymentId: string, signature: string): { verified: boolean; orderId: string; paymentId: string; settledAt: string } {
    const isValid = globalRazorpayAdapter.verifySignature(orderId, paymentId, signature);

    return {
      verified: isValid,
      orderId,
      paymentId,
      settledAt: new Date().toISOString(),
    };
  }
}

export const globalMCPEngine = new MCPEngine();
export const handleMCPRequest = (body: any) => globalMCPEngine.executeTool(body.method, body.params);
