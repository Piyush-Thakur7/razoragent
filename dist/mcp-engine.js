"use strict";
/**
 * RazorAgent MCP (Model Context Protocol) Server Engine
 * Exposes standardized, callable commerce tools for autonomous AI agents.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalMCPEngine = exports.MCPEngine = exports.MCP_TOOLS = void 0;
const catalog_data_1 = require("./catalog-data");
const guardrails_1 = require("./guardrails");
const idempotency_1 = require("./idempotency");
const razorpay_1 = require("./razorpay");
// Active cart session cache
const CART_STORE = new Map();
// Pending promise map to handle exact same-tick async race conditions
const PENDING_ORDER_PROMISES = new Map();
exports.MCP_TOOLS = [
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
class MCPEngine {
    listTools() {
        return exports.MCP_TOOLS;
    }
    async executeTool(toolName, args) {
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
    searchProducts(query, category, maxPrice, minRating) {
        const rawQ = (query || '').toLowerCase().trim();
        const stopWords = new Set(['a', 'an', 'the', 'in', 'for', 'with', 'to', 'me', 'of', 'at', 'on', 'under', 'below', 'buy', 'order', 'get', 'find', 'please', 'want', 'some', 'any', 'good', 'best', 'need', 'i', 'would', 'like', 'show', 'less', 'than']);
        // Extract search tokens (ignore standalone numbers/prices)
        const tokens = rawQ
            .replace(/[^a-z0-9\s-]/g, ' ')
            .split(/\s+/)
            .map((t) => t.trim())
            .filter((t) => t.length > 0 && !stopWords.has(t) && !/^\d+$/.test(t));
        // Entity intent disambiguation: detect target entity to prevent cross-category false positives
        let targetEntity = null;
        const isMouseQuery = tokens.includes('mouse') && !tokens.includes('mat') && !tokens.includes('pad');
        const isLaptopQuery = tokens.includes('laptop') && !tokens.includes('stand') && !tokens.includes('bag') && !tokens.includes('riser');
        const isSpeakerQuery = tokens.includes('speaker') || tokens.includes('speakers');
        const isTshirtQuery = tokens.includes('tshirt') || tokens.includes('shirt') || rawQ.includes('t-shirt');
        const isShoesQuery = tokens.includes('shoes') || tokens.includes('shoe') || tokens.includes('sneakers');
        const isWalletQuery = tokens.includes('wallet');
        const isBackpackQuery = (tokens.includes('backpack') || tokens.includes('bag')) && !isLaptopQuery;
        const isCoffeeQuery = (tokens.includes('coffee') || tokens.includes('roast') || tokens.includes('beans')) && !tokens.includes('grinder') && !tokens.includes('kettle');
        const isHeadphonesQuery = tokens.includes('headphones') || tokens.includes('headphone');
        const isEarbudsQuery = tokens.includes('earbuds') || tokens.includes('earbud');
        const isKeyboardQuery = tokens.includes('keyboard');
        const isWatchQuery = tokens.includes('watch');
        const isProteinQuery = tokens.includes('protein') || tokens.includes('whey');
        if (isMouseQuery)
            targetEntity = 'mouse';
        else if (isLaptopQuery)
            targetEntity = 'laptop';
        else if (isSpeakerQuery)
            targetEntity = 'speaker';
        else if (isTshirtQuery)
            targetEntity = 'tshirt';
        else if (isShoesQuery)
            targetEntity = 'shoes';
        else if (isWalletQuery)
            targetEntity = 'wallet';
        else if (isBackpackQuery)
            targetEntity = 'backpack';
        else if (isCoffeeQuery)
            targetEntity = 'coffee';
        else if (isHeadphonesQuery)
            targetEntity = 'headphones';
        else if (isEarbudsQuery)
            targetEntity = 'earbuds';
        else if (isKeyboardQuery)
            targetEntity = 'keyboard';
        else if (isWatchQuery)
            targetEntity = 'watch';
        else if (isProteinQuery)
            targetEntity = 'protein';
        const scored = catalog_data_1.MERCHANT_CATALOG.map((p) => {
            let score = 0;
            const pNameLower = p.name.toLowerCase();
            const pDescLower = p.description.toLowerCase();
            const pCatLower = p.category.toLowerCase();
            const pTagsLower = p.tags.map((t) => t.toLowerCase());
            // If a specific target entity is recognized, enforce strict entity matching
            if (targetEntity) {
                let isEntityMatch = false;
                if (targetEntity === 'mouse') {
                    isEntityMatch = pTagsLower.includes('mouse') && !pTagsLower.includes('desk mat') && !pTagsLower.includes('mat');
                }
                else if (targetEntity === 'laptop') {
                    isEntityMatch = pTagsLower.includes('laptop') && !pTagsLower.includes('laptop stand') && !pTagsLower.includes('stand') && !pTagsLower.includes('bag');
                }
                else if (targetEntity === 'speaker') {
                    isEntityMatch = pTagsLower.includes('speaker');
                }
                else if (targetEntity === 'tshirt') {
                    isEntityMatch = pTagsLower.includes('tshirt') || pTagsLower.includes('t-shirt') || pTagsLower.includes('shirt');
                }
                else if (targetEntity === 'shoes') {
                    isEntityMatch = pTagsLower.includes('shoes') || pTagsLower.includes('footwear') || pTagsLower.includes('sneakers');
                }
                else if (targetEntity === 'wallet') {
                    isEntityMatch = pTagsLower.includes('wallet');
                }
                else if (targetEntity === 'backpack') {
                    isEntityMatch = pTagsLower.includes('backpack') || pTagsLower.includes('bag');
                }
                else if (targetEntity === 'coffee') {
                    isEntityMatch = pTagsLower.includes('coffee') || pTagsLower.includes('roast') || pTagsLower.includes('beans');
                }
                else if (targetEntity === 'headphones') {
                    isEntityMatch = pTagsLower.includes('headphones') || pTagsLower.includes('headphone');
                }
                else if (targetEntity === 'earbuds') {
                    isEntityMatch = pTagsLower.includes('earbuds') || pTagsLower.includes('earbud');
                }
                else if (targetEntity === 'keyboard') {
                    isEntityMatch = pTagsLower.includes('keyboard');
                }
                else if (targetEntity === 'watch') {
                    isEntityMatch = pTagsLower.includes('watch') || pTagsLower.includes('smartwatch');
                }
                else if (targetEntity === 'protein') {
                    isEntityMatch = pTagsLower.includes('protein') || pTagsLower.includes('whey');
                }
                if (!isEntityMatch) {
                    return { product: p, score: 0, matches: false };
                }
            }
            if (tokens.length === 0) {
                score = 10;
            }
            else {
                // Full phrase match
                if (rawQ && (pNameLower.includes(rawQ) || pTagsLower.some((t) => t.includes(rawQ)))) {
                    score += 120;
                }
                for (const token of tokens) {
                    const singular = token.endsWith('s') && token.length > 3 ? token.slice(0, -1) : token;
                    const plural = token + 's';
                    // 1. Exact Tag Match
                    if (pTagsLower.includes(token) || pTagsLower.includes(singular) || pTagsLower.includes(plural)) {
                        score += 100;
                    }
                    // 2. Exact word match in product name
                    else if (pNameLower.split(/[\s-]+/).includes(token) || pNameLower.split(/[\s-]+/).includes(singular)) {
                        score += 80;
                    }
                    // 3. Category match
                    else if (pCatLower.includes(token) || pCatLower.includes(singular)) {
                        score += 60;
                    }
                    // 4. Substring in name
                    else if (pNameLower.includes(token) || pNameLower.includes(singular)) {
                        score += 40;
                    }
                    // 5. Partial tag match
                    else if (pTagsLower.some((t) => t.includes(token) || token.includes(t))) {
                        score += 25;
                    }
                    // 6. Substring in description
                    else if (pDescLower.includes(token) || pDescLower.includes(singular)) {
                        score += 15;
                    }
                }
            }
            const matchesCategory = !category || p.category.toLowerCase() === category.toLowerCase();
            const matchesPrice = !maxPrice || p.price <= maxPrice;
            const matchesRating = !minRating || p.rating >= minRating;
            // Require minimum score threshold (>= 40) to prevent random loose description matches
            const isConfident = score >= 40;
            return { product: p, score, matches: isConfident && matchesCategory && matchesPrice && matchesRating };
        });
        const results = scored
            .filter((s) => s.matches)
            .sort((a, b) => b.score - a.score)
            .map((s) => s.product);
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
    getProductDetails(productId) {
        const item = catalog_data_1.MERCHANT_CATALOG.find((p) => p.id === productId);
        if (!item) {
            return { error: 'PRODUCT_NOT_FOUND', message: `No product found matching ID: ${productId}` };
        }
        return {
            ...item,
            price_inr: item.price,
            currency: 'INR',
        };
    }
    calculateCartQuote(items, couponCode) {
        const cartItems = [];
        let subtotal = 0;
        for (const reqItem of items) {
            const product = catalog_data_1.MERCHANT_CATALOG.find((p) => p.id === reqItem.product_id);
            if (!product)
                continue;
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
        let appliedCoupon = undefined;
        if (couponCode && catalog_data_1.AVAILABLE_COUPONS[couponCode]) {
            const rule = catalog_data_1.AVAILABLE_COUPONS[couponCode];
            if (subtotal >= rule.minSpendINR) {
                if (rule.flatDiscountINR) {
                    discount = Math.min(rule.flatDiscountINR, subtotal);
                }
                else if (rule.discountPercent) {
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
        const quote = {
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
    evaluateSpendPolicy(cartId) {
        const cart = CART_STORE.get(cartId);
        if (!cart) {
            return {
                allowed: false,
                reasonCode: 'QUANTITY_LIMIT_EXCEEDED',
                message: `Cart session "${cartId}" not found or expired.`,
                evaluatedAt: new Date().toISOString(),
            };
        }
        return guardrails_1.globalGuardrailEngine.evaluate(cart);
    }
    async createGuardedOrder(cartId, idempotencyKey, buyerEmail = 'buyer@agentic.ai') {
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
        const decision = guardrails_1.globalGuardrailEngine.evaluate(cart);
        if (!decision.allowed) {
            return {
                success: false,
                decision,
            };
        }
        // Step 2: Check for in-flight pending creation on exact same key
        if (PENDING_ORDER_PROMISES.has(idempotencyKey)) {
            const existingPromise = PENDING_ORDER_PROMISES.get(idempotencyKey);
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
        const fingerprint = idempotency_1.globalIdempotencyManager.generateFingerprint(agentId, cart);
        const lockResult = idempotency_1.globalIdempotencyManager.acquireLock(idempotencyKey, agentId, fingerprint);
        if (!lockResult.acquired && lockResult.isDuplicate) {
            // 2 AM Race Condition Intercepted! Return cached response without double-billing
            const cachedOrder = lockResult.record.responseCache;
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
                const order = await razorpay_1.globalRazorpayAdapter.createOrder(cart, agentId, buyerEmail);
                idempotency_1.globalIdempotencyManager.completeOrder(idempotencyKey, order.id, order);
                return {
                    success: true,
                    decision,
                    order,
                    isCached: false,
                };
            }
            catch (err) {
                idempotency_1.globalIdempotencyManager.releaseLock(idempotencyKey);
                return {
                    success: false,
                    decision: {
                        allowed: false,
                        reasonCode: 'POLICY_PASSED',
                        message: `Razorpay Order creation error: ${err?.message || 'Gateway connection timeout'}`,
                        evaluatedAt: new Date().toISOString(),
                    },
                };
            }
            finally {
                PENDING_ORDER_PROMISES.delete(idempotencyKey);
            }
        })();
        PENDING_ORDER_PROMISES.set(idempotencyKey, orderPromise);
        return await orderPromise;
    }
    verifyPaymentAndSettle(orderId, paymentId, signature) {
        const isValid = razorpay_1.globalRazorpayAdapter.verifySignature(orderId, paymentId, signature);
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
exports.MCPEngine = MCPEngine;
exports.globalMCPEngine = new MCPEngine();
//# sourceMappingURL=mcp-engine.js.map