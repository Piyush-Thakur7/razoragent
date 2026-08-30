"use strict";
/**
 * RazorAgent Deterministic Guardrail Engine
 * Enforces hard mathematical bounds and merchant safety policies before orders touch Razorpay.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalGuardrailEngine = exports.GuardrailEngine = exports.DEFAULT_GUARDRAIL_CONFIG = void 0;
const catalog_data_1 = require("./catalog-data");
exports.DEFAULT_GUARDRAIL_CONFIG = {
    maxSpendLimitINR: 5000, // ₹5,000 max limit per autonomous transaction
    allowedCategories: ['electronics', 'apparel', 'wellness', 'specialty-coffee', 'home-office'],
    maxQuantityPerItem: 3,
    requireHumanApprovalAboveINR: 8000,
    idempotencyWindowSeconds: 60,
};
class GuardrailEngine {
    constructor(config = {}) {
        this.config = { ...exports.DEFAULT_GUARDRAIL_CONFIG, ...config };
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    getConfig() {
        return { ...this.config };
    }
    /**
     * Deterministically evaluates whether a CartQuote complies with all safety policies.
     */
    evaluate(cart) {
        const timestamp = new Date().toISOString();
        // Rule 1: Empty cart check
        if (!cart.items || cart.items.length === 0) {
            return {
                allowed: false,
                reasonCode: 'QUANTITY_LIMIT_EXCEEDED',
                message: 'Cart is empty. Cannot process a zero-item order.',
                evaluatedAt: timestamp,
            };
        }
        // Rule 2: Item-level constraints: Category whitelist, Quantity bounds, and Stock
        for (const item of cart.items) {
            const catalogItem = catalog_data_1.MERCHANT_CATALOG.find((p) => p.id === item.productId);
            // Check item quantity limits (evaluated before spend cap to catch SKU hoarding)
            if (item.quantity > this.config.maxQuantityPerItem) {
                return {
                    allowed: false,
                    reasonCode: 'QUANTITY_LIMIT_EXCEEDED',
                    message: `Requested quantity (${item.quantity}) for "${item.name}" exceeds the maximum allowed quantity (${this.config.maxQuantityPerItem}) per transaction.`,
                    evaluatedAt: timestamp,
                    metadata: {
                        productId: item.productId,
                        requestedQty: item.quantity,
                        maxAllowedQty: this.config.maxQuantityPerItem,
                    },
                };
            }
            if (catalogItem) {
                // Check category whitelist
                if (!this.config.allowedCategories.includes(catalogItem.category)) {
                    return {
                        allowed: false,
                        reasonCode: 'CATEGORY_PROHIBITED',
                        message: `Category "${catalogItem.category}" is not in the merchant's approved autonomous sales whitelist.`,
                        evaluatedAt: timestamp,
                        metadata: {
                            productId: item.productId,
                            prohibitedCategory: catalogItem.category,
                        },
                    };
                }
                // Check live stock
                if (item.quantity > catalogItem.stock) {
                    return {
                        allowed: false,
                        reasonCode: 'OUT_OF_STOCK',
                        message: `Insufficient inventory for "${item.name}". Requested: ${item.quantity}, Available: ${catalogItem.stock}.`,
                        evaluatedAt: timestamp,
                        metadata: {
                            productId: item.productId,
                            stockAvailable: catalogItem.stock,
                        },
                    };
                }
            }
        }
        // Rule 3: Hard Spend Cap per autonomous transaction
        if (cart.totalAmount > this.config.maxSpendLimitINR) {
            return {
                allowed: false,
                reasonCode: 'BUDGET_EXCEEDED',
                message: `Total amount (₹${cart.totalAmount.toLocaleString('en-IN')}) exceeds the autonomous spend cap of ₹${this.config.maxSpendLimitINR.toLocaleString('en-IN')}.`,
                evaluatedAt: timestamp,
                metadata: {
                    requestedAmount: cart.totalAmount,
                    maxAllowed: this.config.maxSpendLimitINR,
                    difference: cart.totalAmount - this.config.maxSpendLimitINR,
                },
            };
        }
        // Rule 4: High-Value Human Gating
        if (cart.totalAmount > this.config.requireHumanApprovalAboveINR) {
            return {
                allowed: false,
                reasonCode: 'HUMAN_APPROVAL_REQUIRED',
                message: `Transactions above ₹${this.config.requireHumanApprovalAboveINR.toLocaleString('en-IN')} require 2FA human biometric confirmation.`,
                evaluatedAt: timestamp,
                metadata: {
                    threshold: this.config.requireHumanApprovalAboveINR,
                },
            };
        }
        // All deterministic checks passed
        return {
            allowed: true,
            reasonCode: 'POLICY_PASSED',
            message: 'Transaction complies with all autonomous spending limits, inventory rules, and category guardrails.',
            evaluatedAt: timestamp,
            metadata: {
                totalAmount: cart.totalAmount,
                itemCount: cart.items.length,
            },
        };
    }
}
exports.GuardrailEngine = GuardrailEngine;
exports.globalGuardrailEngine = new GuardrailEngine();
//# sourceMappingURL=guardrails.js.map