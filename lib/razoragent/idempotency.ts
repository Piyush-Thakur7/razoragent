/**
 * RazorAgent Cryptographic Idempotency & Concurrency Manager
 * Prevents double-billing, race conditions, and LLM retry storms using SHA-256 state locks.
 */

import crypto from 'crypto';
import { CartQuote, IdempotencyRecord } from './types';

export class IdempotencyLockManager {
  private store: Map<string, IdempotencyRecord> = new Map();
  private ttlMs: number;

  constructor(ttlSeconds: number = 60) {
    this.ttlMs = ttlSeconds * 1000;
  }

  /**
   * Generates a deterministic SHA-256 hash representing the agent's intent & cart contents.
   */
  public generateFingerprint(agentId: string, cart: CartQuote, clientNonce?: string): string {
    const canonicalPayload = {
      agentId,
      items: cart.items.map((i) => ({ id: i.productId, qty: i.quantity, price: i.unitPrice })).sort((a, b) => a.id.localeCompare(b.id)),
      totalAmount: cart.totalAmount,
      coupon: cart.couponApplied || 'NONE',
      nonce: clientNonce || 'DEFAULT_NONCE',
    };

    return crypto.createHash('sha256').update(JSON.stringify(canonicalPayload)).digest('hex');
  }

  /**
   * Attempts to acquire an atomic execution lock for a transaction.
   * Returns { acquired: true } if this is the first attempt.
   * Returns { acquired: false, existingRecord } if a concurrent attempt or duplicate request is intercepted.
   */
  public acquireLock(
    key: string,
    agentId: string,
    cartFingerprint: string
  ): { acquired: boolean; record: IdempotencyRecord; isDuplicate: boolean } {
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
    const record: IdempotencyRecord = {
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
  public completeOrder(key: string, orderId: string, responseData: unknown): void {
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
  public releaseLock(key: string): void {
    this.store.delete(key);
  }

  /**
   * Purges expired records from memory.
   */
  private purgeExpiredRecords(now: number): void {
    for (const [k, record] of this.store.entries()) {
      if (record.expiresAt <= now) {
        this.store.delete(k);
      }
    }
  }

  public getAllActiveLocks(): IdempotencyRecord[] {
    const now = Date.now();
    this.purgeExpiredRecords(now);
    return Array.from(this.store.values());
  }

  public clearAll(): void {
    this.store.clear();
  }
}

export const globalIdempotencyManager = new IdempotencyLockManager(60);
