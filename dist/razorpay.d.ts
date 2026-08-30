/**
 * RazorAgent Razorpay Integration Adapter
 * Supports live Razorpay API keys as well as high-fidelity Test Mode simulation.
 */
import { CartQuote, RazorpayOrderResponse } from './types';
export declare class RazorpayAdapter {
    private keyId;
    private keySecret;
    private isTestMode;
    constructor();
    /**
     * Creates a Razorpay Order.
     * Conforms to Razorpay Orders API specification.
     */
    createOrder(cart: CartQuote, agentId: string, principalEmail?: string): Promise<RazorpayOrderResponse>;
    /**
     * Verifies Razorpay HMAC SHA-256 Webhook or Payment Signature.
     */
    verifySignature(orderId: string, paymentId: string, signature: string): boolean;
    /**
     * Generates a valid test HMAC signature for demonstration / automated tests.
     */
    generateTestSignature(orderId: string, paymentId: string): string;
    getMode(): string;
}
export declare const globalRazorpayAdapter: RazorpayAdapter;
//# sourceMappingURL=razorpay.d.ts.map