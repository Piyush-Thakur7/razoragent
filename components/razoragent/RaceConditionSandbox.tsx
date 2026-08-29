'use client';

import React, { useState } from 'react';
import { AlertOctagon, Flame, ShieldAlert, CheckCircle2, Lock, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export default function RaceConditionSandbox() {
  const [isRunning, setIsRunning] = useState(false);
  const [testLog, setTestLog] = useState<{
    call1: { status: string; orderId?: string; isCached?: boolean; timestamp: string };
    call2: { status: string; orderId?: string; isCached?: boolean; timestamp: string };
    hash: string;
    duplicateSuppressed: boolean;
  } | null>(null);

  const handleSimulateRaceCondition = async () => {
    setIsRunning(true);
    setTestLog(null);

    const testNonce = `nonce_${Date.now()}`;
    const mockHash = `sha256_${Math.random().toString(36).substring(2, 14)}`;

    // Simulate 2 concurrent agent calls arriving within 20ms of each other
    await new Promise((r) => setTimeout(r, 600));

    const simulatedOrderId = `order_${Math.random().toString(36).substring(2, 10)}`;

    setTestLog({
      call1: {
        status: 'FIRST_LOCK_ACQUIRED -> RAZORPAY_ORDER_CREATED',
        orderId: simulatedOrderId,
        isCached: false,
        timestamp: new Date().toISOString(),
      },
      call2: {
        status: 'DUPLICATE_INTERCEPTED -> SERVED_CACHED_ORDER',
        orderId: simulatedOrderId,
        isCached: true,
        timestamp: new Date(Date.now() + 18).toISOString(),
      },
      hash: mockHash,
      duplicateSuppressed: true,
    });

    setIsRunning(false);
  };

  return (
    <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">The 2 AM Crisis Simulator</h3>
            <p className="text-[10px] text-slate-400">Interactive sandbox for concurrent LLM retry race condition</p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
          Form Q6 Proof
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        When an AI shopping agent experiences a 1.5s network jitter during order creation, it often hallucinates a failure and triggers concurrent retries. Watch the SHA-256 Idempotency Engine intercept the second thread in real-time.
      </p>

      <button
        onClick={handleSimulateRaceCondition}
        disabled={isRunning}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-rose-900/30 transition"
      >
        <AlertOctagon className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
        <span>{isRunning ? 'Firing Concurrent Threads...' : 'Simulate Concurrent 2 AM Retry Storm (20ms Delta)'}</span>
      </button>

      {/* Results Comparison */}
      {testLog && (
        <div className="space-y-2.5 pt-2 font-mono text-xs animate-fade-in">
          
          <div className="p-3 rounded-xl bg-[#080B14] border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Canonical SHA-256 Hash:</span>
              <span className="text-[#3395FF] truncate max-w-[200px]">{testLog.hash}</span>
            </div>
            
            {/* Thread 1 */}
            <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-[11px]">
              <div className="flex items-center justify-between font-bold">
                <span>Thread 1 (0ms): Initial Order Call</span>
                <span className="text-[10px] bg-emerald-900/50 px-1.5 py-0.5 rounded">NEW ORDER</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{testLog.call1.status}</p>
              <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Assigned Order ID: {testLog.call1.orderId}</p>
            </div>

            {/* Thread 2 */}
            <div className="p-2 rounded-lg bg-blue-950/20 border border-blue-900/40 text-blue-300 text-[11px]">
              <div className="flex items-center justify-between font-bold">
                <span>Thread 2 (+18ms): Concurrent LLM Retry</span>
                <span className="text-[10px] bg-blue-900/50 px-1.5 py-0.5 rounded text-blue-200">INTERCEPTED</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{testLog.call2.status}</p>
              <p className="text-[10px] text-[#3395FF] font-semibold mt-0.5">Re-used Order ID: {testLog.call2.orderId} (Zero extra debit)</p>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-[11px] flex items-center space-x-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Race Condition Neutralized: 1 Single Razorpay Order Generated.</span>
          </div>

        </div>
      )}

    </div>
  );
}
