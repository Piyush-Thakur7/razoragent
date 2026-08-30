/**
 * RazorAgent Automated Verification & Benchmark Suite
 * Runs rigorous automated tests on policy guardrails, Razorpay order settlement, and the 2 AM race condition.
 */
import { TestResult } from './types';
export declare class RazorAgentTestSuite {
    runAllTests(): Promise<{
        passedCount: number;
        totalCount: number;
        results: TestResult[];
    }>;
    private testHappyPathCheckout;
    private testBudgetExceededInterception;
    private testQuantityLimitGuardrail;
    private test2AMConcurrentRaceCondition;
    private testHMACWebhookSignature;
}
export declare const globalTestSuite: RazorAgentTestSuite;
//# sourceMappingURL=test-suite.d.ts.map