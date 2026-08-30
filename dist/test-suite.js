"use strict";
/**
 * RazorAgent Automated Verification & Benchmark Suite
 * Runs rigorous automated tests on policy guardrails, Razorpay order settlement, and the 2 AM race condition.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalTestSuite = exports.RazorAgentTestSuite = void 0;
const agent_engine_1 = require("./agent-engine");
const mcp_engine_1 = require("./mcp-engine");
const guardrails_1 = require("./guardrails");
const razorpay_1 = require("./razorpay");
class RazorAgentTestSuite {
    async runAllTests() {
        const results = [];
        // Test 1: Happy Path Agentic Checkout
        results.push(await this.testHappyPathCheckout());
        // Test 2: Bounded Spend Policy Interception (Budget Exceeded)
        results.push(await this.testBudgetExceededInterception());
        // Test 3: Quantity Limit Guardrail
        results.push(await this.testQuantityLimitGuardrail());
        // Test 4: The 2 AM Concurrency & Idempotency Race Condition
        results.push(await this.test2AMConcurrentRaceCondition());
        // Test 5: HMAC SHA-256 Webhook Signature Verification
        results.push(await this.testHMACWebhookSignature());
        // Test 6: Pluggable Catalog Provider Contract Resolution
        results.push(await this.testPluggableCatalogProviders());
        const passedCount = results.filter((r) => r.status === 'PASSED').length;
        return {
            passedCount,
            totalCount: results.length,
            results,
        };
    }
    async testHappyPathCheckout() {
        const start = Date.now();
        const result = await agent_engine_1.globalAgentSimulator.simulatePurchase('Find me a Keychron mechanical keyboard under ₹4,000 and complete checkout');
        const passed = result.success && !!result.order?.id && result.order.id.startsWith('order_');
        return {
            testId: 'TEST_01_HAPPY_PATH',
            name: 'Happy Path Autonomous Agent Checkout',
            category: 'AGENTIC_COMMERCE',
            status: passed ? 'PASSED' : 'FAILED',
            durationMs: Date.now() - start,
            expected: 'Status: SUCCESS, Order ID generated with prefix "order_"',
            actual: `Status: ${result.success ? 'SUCCESS' : 'FAILED'}, Order ID: ${result.order?.id || 'NONE'}`,
            details: {
                orderId: result.order?.id,
                amountINR: result.finalCart?.totalAmount,
                reason: result.policyDecision?.reasonCode,
            },
        };
    }
    async testBudgetExceededInterception() {
        const start = Date.now();
        // Sony XM5 is ₹18,990, exceeding default ₹5,000 limit
        const result = await agent_engine_1.globalAgentSimulator.simulatePurchase('Buy Sony WH-1000XM5 headphones for ₹18,990');
        const passed = !result.success &&
            result.policyDecision?.reasonCode === 'BUDGET_EXCEEDED' &&
            !result.order;
        return {
            testId: 'TEST_02_BUDGET_GUARDRAIL',
            name: 'Deterministic Budget Cap Enforcement',
            category: 'GUARDRAILS',
            status: passed ? 'PASSED' : 'FAILED',
            durationMs: Date.now() - start,
            expected: 'Blocked with reasonCode: BUDGET_EXCEEDED, Zero Razorpay orders generated',
            actual: `Blocked: ${!result.success}, ReasonCode: ${result.policyDecision?.reasonCode}`,
            details: {
                spendCap: guardrails_1.globalGuardrailEngine.getConfig().maxSpendLimitINR,
                requestedAmount: result.finalCart?.totalAmount,
                message: result.policyDecision?.message,
            },
        };
    }
    async testQuantityLimitGuardrail() {
        const start = Date.now();
        // Attempt to order 8 units of coffee when max is 3
        const result = await agent_engine_1.globalAgentSimulator.simulatePurchase('Order 8 units of Blue Tokai coffee');
        const passed = !result.success &&
            result.policyDecision?.reasonCode === 'QUANTITY_LIMIT_EXCEEDED';
        return {
            testId: 'TEST_03_QUANTITY_GUARDRAIL',
            name: 'SKU Hoarding & Quantity Bounds Enforcement',
            category: 'GUARDRAILS',
            status: passed ? 'PASSED' : 'FAILED',
            durationMs: Date.now() - start,
            expected: 'Blocked with reasonCode: QUANTITY_LIMIT_EXCEEDED',
            actual: `Blocked: ${!result.success}, ReasonCode: ${result.policyDecision?.reasonCode}`,
            details: {
                maxQuantityAllowed: guardrails_1.globalGuardrailEngine.getConfig().maxQuantityPerItem,
                decision: result.policyDecision,
            },
        };
    }
    async test2AMConcurrentRaceCondition() {
        const start = Date.now();
        const sharedKey = `test_race_lock_${Date.now()}`;
        // Create initial cart quote
        const quote = await mcp_engine_1.globalMCPEngine.executeTool('calculate_cart_quote', {
            items: [{ product_id: 'prod_mat_07', quantity: 1 }],
        });
        // Fire 2 concurrent order creation calls simultaneously with exact same idempotency key
        const [call1, call2] = await Promise.all([
            mcp_engine_1.globalMCPEngine.executeTool('create_guarded_order', {
                cart_id: quote.cartId,
                idempotency_key: sharedKey,
                buyer_email: 'agent1@ai.test',
            }),
            mcp_engine_1.globalMCPEngine.executeTool('create_guarded_order', {
                cart_id: quote.cartId,
                idempotency_key: sharedKey,
                buyer_email: 'agent1@ai.test',
            }),
        ]);
        // Exactly one order should be created, and the duplicate must share the exact same Order ID
        const passed = (call1.isCached || call2.isCached) &&
            !!call1.order?.id &&
            !!call2.order?.id &&
            call1.order.id === call2.order.id;
        return {
            testId: 'TEST_04_2AM_RACE_CONDITION',
            name: '2 AM Concurrency & Duplicate Retry Suppression',
            category: 'IDEMPOTENCY_2AM',
            status: passed ? 'PASSED' : 'FAILED',
            durationMs: Date.now() - start,
            expected: 'Duplicate request intercepted by SHA-256 Idempotency Lock with single unified Razorpay order',
            actual: `Order 1 ID: ${call1.order?.id} (Cached: ${call1.isCached}), Order 2 ID: ${call2.order?.id} (Cached: ${call2.isCached})`,
            details: {
                sharedIdempotencyKey: sharedKey,
                call1OrderId: call1.order?.id,
                call2OrderId: call2.order?.id,
                duplicateSuppressed: call1.isCached || call2.isCached,
            },
        };
    }
    async testHMACWebhookSignature() {
        const start = Date.now();
        const testOrderId = 'order_test_9999';
        const testPaymentId = 'pay_test_8888';
        const validSignature = razorpay_1.globalRazorpayAdapter.generateTestSignature(testOrderId, testPaymentId);
        const isValid = razorpay_1.globalRazorpayAdapter.verifySignature(testOrderId, testPaymentId, validSignature);
        const isInvalidRejected = !razorpay_1.globalRazorpayAdapter.verifySignature(testOrderId, testPaymentId, 'corrupted_signature_xyz');
        const passed = isValid && isInvalidRejected;
        return {
            testId: 'TEST_05_HMAC_WEBHOOK_VERIFY',
            name: 'HMAC-SHA256 Cryptographic Webhook & Settlement Verifier',
            category: 'RAZORPAY_API',
            status: passed ? 'PASSED' : 'FAILED',
            durationMs: Date.now() - start,
            expected: 'Valid signature returns TRUE, tampered signature returns FALSE',
            actual: `Valid Check: ${isValid}, Tampered Rejection: ${isInvalidRejected}`,
            details: {
                orderId: testOrderId,
                paymentId: testPaymentId,
                validSignaturePreview: `${validSignature.substring(0, 16)}...`,
            },
        };
    }
    async testPluggableCatalogProviders() {
        const start = Date.now();
        const activeProvider = mcp_engine_1.globalMCPEngine.getCatalogProvider();
        const products = await activeProvider.searchProducts('wireless mouse');
        const hasProducts = products.length > 0;
        const providerName = activeProvider.getProviderName();
        return {
            testId: 'TEST_06_PLUGGABLE_CATALOG',
            name: 'Pluggable CatalogProvider Contract & Resolution',
            category: 'CATALOG_ARCHITECTURE',
            status: hasProducts ? 'PASSED' : 'FAILED',
            durationMs: Date.now() - start,
            expected: 'Active provider resolves and returns valid ProductItem[] objects with prices and specs',
            actual: `Provider: ${providerName}, Found ${products.length} product(s)`,
            details: {
                providerName,
                sampleProduct: products[0]?.name,
                samplePrice: products[0]?.price,
            },
        };
    }
}
exports.RazorAgentTestSuite = RazorAgentTestSuite;
exports.globalTestSuite = new RazorAgentTestSuite();
//# sourceMappingURL=test-suite.js.map