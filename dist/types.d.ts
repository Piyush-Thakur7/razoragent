/**
 * RazorAgent: Bounded MCP Commerce & Settlement Gateway for Autonomous AI Buyers
 * Core TypeScript Definitions & Protocol Schemas
 */
export type ProductCategory = 'electronics' | 'apparel' | 'wellness' | 'specialty-coffee' | 'home-office' | 'software-licenses' | (string & {});
export interface ProductItem {
    id: string;
    name: string;
    category: ProductCategory;
    price: number;
    rating: number;
    reviewCount: number;
    stock: number;
    description: string;
    specs: Record<string, string>;
    tags: string[];
    image: string;
    eligibleCoupons: string[];
}
export interface CartItem {
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}
export interface CartQuote {
    cartId: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    couponApplied?: string;
    tax: number;
    shipping: number;
    totalAmount: number;
    currency: 'INR';
}
export interface BuyerInfo {
    agentId: string;
    principalName: string;
    principalEmail: string;
    deliveryAddress: {
        line1: string;
        city: string;
        state: string;
        pincode: string;
    };
    preferredPaymentRail: 'upi_intent' | 'payment_link' | 'card_mandate';
}
export interface GuardrailPolicyConfig {
    maxSpendLimitINR: number;
    allowedCategories: ProductCategory[];
    maxQuantityPerItem: number;
    requireHumanApprovalAboveINR: number;
    idempotencyWindowSeconds: number;
}
export interface PolicyDecision {
    allowed: boolean;
    reasonCode: 'POLICY_PASSED' | 'BUDGET_EXCEEDED' | 'CATEGORY_PROHIBITED' | 'QUANTITY_LIMIT_EXCEEDED' | 'OUT_OF_STOCK' | 'HUMAN_APPROVAL_REQUIRED' | 'IDEMPOTENCY_RETRY_SUPPRESSED';
    message: string;
    evaluatedAt: string;
    metadata?: Record<string, unknown>;
}
export interface IdempotencyRecord {
    key: string;
    hash: string;
    agentId: string;
    cartFingerprint: string;
    status: 'INITIATED' | 'LOCKED' | 'ORDER_CREATED' | 'CAPTURED' | 'FAILED';
    orderId?: string;
    createdAt: number;
    expiresAt: number;
    responseCache?: unknown;
}
export interface RazorpayOrderPayload {
    amount: number;
    currency: 'INR';
    receipt: string;
    notes: {
        agent_id: string;
        principal_email: string;
        cart_id: string;
        policy_hash: string;
        agentic_commerce_protocol: string;
    };
}
export interface RazorpayOrderResponse {
    id: string;
    entity: 'order';
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: 'INR';
    receipt: string;
    status: 'created' | 'attempted' | 'paid';
    attempts: number;
    notes: Record<string, string>;
    created_at: number;
    payment_link?: string;
    short_url?: string;
    upi_intent_uri?: string;
}
export interface AuditEvent {
    id: string;
    timestamp: string;
    agentId: string;
    eventType: 'AGENT_DISCOVERY' | 'TOOL_CALL_EXECUTED' | 'POLICY_EVALUATED' | 'IDEMPOTENCY_LATCH_ACQUIRED' | 'RAZORPAY_ORDER_CREATED' | 'PAYMENT_LINK_DISPATCHED' | 'WEBHOOK_SIGNATURE_VERIFIED' | 'ERROR_MITIGATED';
    toolName?: string;
    status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
    latencyMs: number;
    details: Record<string, unknown>;
}
export interface MCPToolDefinition {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, unknown>;
        required: string[];
    };
}
export interface AgentSimulationStep {
    stepIndex: number;
    phase: 'PERCEPTION' | 'REASONING' | 'TOOL_CALL' | 'POLICY_GATE' | 'SETTLEMENT';
    thought: string;
    toolCall?: {
        name: string;
        arguments: Record<string, unknown>;
    };
    toolResult?: Record<string, unknown>;
    policyResult?: PolicyDecision;
    orderResult?: RazorpayOrderResponse;
    timestamp: string;
}
export interface SimulationResult {
    prompt: string;
    agentSessionId: string;
    success: boolean;
    steps: AgentSimulationStep[];
    finalCart?: CartQuote;
    policyDecision?: PolicyDecision;
    order?: RazorpayOrderResponse;
    totalDurationMs: number;
}
export interface TestResult {
    testId: string;
    name: string;
    category: 'GUARDRAILS' | 'IDEMPOTENCY_2AM' | 'RAZORPAY_API' | 'AGENTIC_COMMERCE';
    status: 'PASSED' | 'FAILED';
    durationMs: number;
    expected: string;
    actual: string;
    details: Record<string, unknown>;
}
//# sourceMappingURL=types.d.ts.map