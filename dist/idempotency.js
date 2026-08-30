"use strict";
/**
 * RazorAgent Cryptographic Idempotency & Concurrency Manager
 * Prevents double-billing, race conditions, and LLM retry storms using SHA-256 state locks.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalIdempotencyManager = exports.IdempotencyLockManager = void 0;
const crypto_1 = __importDefault(require("crypto"));
class IdempotencyLockManager {
    constructor(ttlSeconds = 60) {
        this.store = new Map();
        this.ttlMs = ttlSeconds * 1000;
    }
    /**
     * Generates a deterministic SHA-256 hash representing the agent's intent & cart contents.
     */
    generateFingerprint(agentId, cart, clientNonce) {
        const canonicalPayload = {
            agentId,
            items: cart.items.map((i) => ({ id: i.productId, qty: i.quantity, price: i.unitPrice })).sort((a, b) => a.id.localeCompare(b.id)),
            totalAmount: cart.totalAmount,
            coupon: cart.couponApplied || 'NONE',
            nonce: clientNonce || 'DEFAULT_NONCE',
        };
        return crypto_1.default.createHash('sha256').update(JSON.stringify(canonicalPayload)).digest('hex');
    }
    /**
     * Attempts to acquire an atomic execution lock for a transaction.
     * Returns { acquired: true } if this is the first attempt.
     * Returns { acquired: false, existingRecord } if a concurrent attempt or duplicate request is intercepted.
     */
    acquireLock(key, agentId, cartFingerprint) {
        const now = Date.now();
        this.purgeExpiredRecords(now);
        const existing = this.store.get(key);
        if (existing) {
            // Record exists and is still valid
            if (existing.expiresAt > now) {
                return {
                    acquired: false,
                    record: existing,
                    isDuplicate: true,
                };
            }
        }
        // New lock acquisition
        const record = {
            key,
            hash: cartFingerprint,
            agentId,
            cartFingerprint,
            status: 'LOCKED',
            createdAt: now,
            expiresAt: now + this.ttlMs,
        };
        this.store.set(key, record);
        return {
            acquired: true,
            record,
            isDuplicate: false,
        };
    }
    /**
     * Transitions lock to ORDER_CREATED with cached Razorpay order details.
     */
    completeOrder(key, orderId, responseData) {
        const record = this.store.get(key);
        if (record) {
            record.status = 'ORDER_CREATED';
            record.orderId = orderId;
            record.responseCache = responseData;
            this.store.set(key, record);
        }
    }
    /**
     * Releases lock in case of validation failure so the agent can modify and retry.
     */
    releaseLock(key) {
        this.store.delete(key);
    }
    /**
     * Purges expired records from memory.
     */
    purgeExpiredRecords(now) {
        for (const [k, record] of this.store.entries()) {
            if (record.expiresAt <= now) {
                this.store.delete(k);
            }
        }
    }
    getAllActiveLocks() {
        const now = Date.now();
        this.purgeExpiredRecords(now);
        return Array.from(this.store.values());
    }
    clearAll() {
        this.store.clear();
    }
}
exports.IdempotencyLockManager = IdempotencyLockManager;
exports.globalIdempotencyManager = new IdempotencyLockManager(60);
//# sourceMappingURL=idempotency.js.map