/**
 * RazorAgent Cryptographic Idempotency & Concurrency Manager
 * Prevents double-billing, race conditions, and LLM retry storms using SHA-256 state locks.
 */
import { CartQuote, IdempotencyRecord } from './types';
export declare class IdempotencyLockManager {
    private store;
    private ttlMs;
    constructor(ttlSeconds?: number);
    /**
     * Generates a deterministic SHA-256 hash representing the agent's intent & cart contents.
     */
    generateFingerprint(agentId: string, cart: CartQuote, clientNonce?: string): string;
    /**
     * Attempts to acquire an atomic execution lock for a transaction.
     * Returns { acquired: true } if this is the first attempt.
     * Returns { acquired: false, existingRecord } if a concurrent attempt or duplicate request is intercepted.
     */
    acquireLock(key: string, agentId: string, cartFingerprint: string): {
        acquired: boolean;
        record: IdempotencyRecord;
        isDuplicate: boolean;
    };
    /**
     * Transitions lock to ORDER_CREATED with cached Razorpay order details.
     */
    completeOrder(key: string, orderId: string, responseData: unknown): void;
    /**
     * Releases lock in case of validation failure so the agent can modify and retry.
     */
    releaseLock(key: string): void;
    /**
     * Purges expired records from memory.
     */
    private purgeExpiredRecords;
    getAllActiveLocks(): IdempotencyRecord[];
    clearAll(): void;
}
export declare const globalIdempotencyManager: IdempotencyLockManager;
//# sourceMappingURL=idempotency.d.ts.map