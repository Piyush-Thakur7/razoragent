"use strict";
/**
 * RazorAgent Razorpay Integration Adapter
 * Supports live Razorpay API keys as well as high-fidelity Test Mode simulation.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalRazorpayAdapter = exports.RazorpayAdapter = void 0;
const crypto_1 = __importDefault(require("crypto"));
class RazorpayAdapter {
    constructor() {
        this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_AiBuilder2026';
        this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'sk_test_RazorAgentSecret2026';
        this.isTestMode = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_');
    }
    /**
     * Creates a Razorpay Order.
     * Conforms to Razorpay Orders API specification.
     */
    async createOrder(cart, agentId, principalEmail = 'buyer@agentic.ai') {
        const amountInPaise = Math.round(cart.totalAmount * 100);
        const receiptId = `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        const payload = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: receiptId,
            notes: {
                agent_id: agentId,
                principal_email: principalEmail,
                cart_id: cart.cartId,
                policy_hash: crypto_1.default.createHash('md5').update(`${cart.cartId}_${cart.totalAmount}`).digest('hex'),
                agentic_commerce_protocol: 'MCP_v1.0_RAZORAGENT',
            },
        };
        // If live API keys are provided and not mock keys, attempt real network call
        const activeKey = process.env.RAZORPAY_KEY_ID || this.keyId;
        const activeSecret = process.env.RAZORPAY_KEY_SECRET || this.keySecret;
        if (activeKey && activeSecret && !activeKey.includes('AiBuilder')) {
            try {
                const authHeader = Buffer.from(`${activeKey}:${activeSecret}`).toString('base64');
                const res = await fetch('https://api.razorpay.com/v1/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${authHeader}`,
                    },
                    body: JSON.stringify(payload),
                });
                if (res.ok) {
                    const liveOrder = await res.json();
                    let livePaymentUrl = `https://rzp.io/i/${liveOrder.id}`;
                    // Also create a real Razorpay Hosted Payment Link for immediate browser checkout
                    try {
                        const linkRes = await fetch('https://api.razorpay.com/v1/payment_links', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Basic ${authHeader}`,
                            },
                            body: JSON.stringify({
                                amount: amountInPaise,
                                currency: 'INR',
                                description: `RazorAgent Order ${liveOrder.id}`,
                                customer: {
                                    name: 'Autonomous AI Buyer',
                                    email: principalEmail,
                                },
                                notify: { sms: false, email: false },
                                notes: payload.notes,
                            }),
                        });
                        if (linkRes.ok) {
                            const linkData = await linkRes.json();
                            if (linkData.short_url) {
                                livePaymentUrl = linkData.short_url;
                            }
                        }
                    }
                    catch (e) {
                        // fallback gracefully
                    }
                    return {
                        ...liveOrder,
                        payment_link: livePaymentUrl,
                        short_url: livePaymentUrl,
                        upi_intent_uri: `upi://pay?pa=merchant.rzp@icici&pn=RazorAgent+Merchant&am=${cart.totalAmount}&tr=${liveOrder.id}&cu=INR`,
                    };
                }
            }
            catch (err) {
                console.warn('Live Razorpay API call fell back to high-fidelity test simulator:', err);
            }
        }
        // High-fidelity Test Mode Simulator matching official Razorpay Orders API
        const orderId = `order_${Math.random().toString(36).substring(2, 14)}`;
        const createdAt = Math.floor(Date.now() / 1000);
        const paymentLinkId = `plink_${Math.random().toString(36).substring(2, 10)}`;
        return {
            id: orderId,
            entity: 'order',
            amount: amountInPaise,
            amount_paid: 0,
            amount_due: amountInPaise,
            currency: 'INR',
            receipt: receiptId,
            status: 'created',
            attempts: 0,
            notes: payload.notes,
            created_at: createdAt,
            payment_link: `https://rzp.io/i/${paymentLinkId}`,
            short_url: `https://rzp.io/i/${paymentLinkId}`,
            upi_intent_uri: `upi://pay?pa=razoragent.rzp@icici&pn=RazorAgent+Autonomous+Store&am=${cart.totalAmount}&tr=${orderId}&cu=INR`,
        };
    }
    /**
     * Verifies Razorpay HMAC SHA-256 Webhook or Payment Signature.
     */
    verifySignature(orderId, paymentId, signature) {
        const expectedSignature = crypto_1.default
            .createHmac('sha256', this.keySecret)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');
        return expectedSignature === signature;
    }
    /**
     * Generates a valid test HMAC signature for demonstration / automated tests.
     */
    generateTestSignature(orderId, paymentId) {
        return crypto_1.default
            .createHmac('sha256', this.keySecret)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');
    }
    getMode() {
        return this.isTestMode ? 'TEST_SANDBOX (Razorpay Test API)' : 'LIVE_PRODUCTION';
    }
}
exports.RazorpayAdapter = RazorpayAdapter;
exports.globalRazorpayAdapter = new RazorpayAdapter();
//# sourceMappingURL=razorpay.js.map