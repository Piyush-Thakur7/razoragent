/**
 * RazorAgent Deterministic Guardrail Engine
 * Enforces hard mathematical bounds and merchant safety policies before orders touch Razorpay.
 */
import { CartQuote, GuardrailPolicyConfig, PolicyDecision } from './types';
export declare const DEFAULT_GUARDRAIL_CONFIG: GuardrailPolicyConfig;
export declare class GuardrailEngine {
    private config;
    constructor(config?: Partial<GuardrailPolicyConfig>);
    updateConfig(newConfig: Partial<GuardrailPolicyConfig>): void;
    getConfig(): GuardrailPolicyConfig;
    /**
     * Deterministically evaluates whether a CartQuote complies with all safety policies.
     */
    evaluate(cart: CartQuote): PolicyDecision;
}
export declare const globalGuardrailEngine: GuardrailEngine;
//# sourceMappingURL=guardrails.d.ts.map