'use client';

import React from 'react';
import { X, CheckCircle2, XCircle, Activity, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { TestResult } from '@/lib/razoragent/test-suite';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: TestResult[] | null;
  isLoading: boolean;
  onRerun: () => void;
}

export default function BenchmarkModal({ isOpen, onClose, results, isLoading, onRerun }: BenchmarkModalProps) {
  if (!isOpen) return null;

  const passedCount = results ? results.filter((r) => r.status === 'PASSED').length : 0;
  const totalCount = results ? results.length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B0F19] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#0E1322] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#0C8CE9]/20 text-[#3395FF]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Automated System Benchmarks</h3>
              <p className="text-[11px] text-slate-400">Verifying Guardrails, Idempotency Locks & Razorpay APIs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 font-mono text-xs flex-1">
          
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#3395FF] border-t-transparent animate-spin"></div>
              <p className="font-sans text-sm font-medium text-slate-300">Running 5 Automated Test Suites...</p>
            </div>
          )}

          {!isLoading && results && (
            <>
              {/* Scorecard */}
              <div className="p-3.5 rounded-xl bg-[#121A2C] border border-[#0C8CE9]/40 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-sans">Verification Score:</span>
                  <div className="text-xl font-bold text-white mt-0.5">
                    <span className="text-emerald-400">{passedCount}</span> / {totalCount} Test Suites Passed
                  </div>
                </div>
                <button
                  onClick={onRerun}
                  className="px-3 py-1.5 rounded-lg bg-[#0C8CE9] hover:bg-[#0972BD] text-white text-xs font-sans font-semibold transition"
                >
                  Re-run All
                </button>
              </div>

              {/* List of Test Cases */}
              <div className="space-y-2 pt-2">
                {results.map((test) => (
                  <div
                    key={test.testId}
                    className={`p-3 rounded-xl border ${
                      test.status === 'PASSED'
                        ? 'bg-emerald-950/20 border-emerald-900/50 text-slate-200'
                        : 'bg-rose-950/20 border-rose-900/50 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {test.status === 'PASSED' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="font-bold text-xs text-white">{test.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {test.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {test.durationMs}ms
                      </span>
                    </div>

                    <div className="mt-2 space-y-1 text-[11px] text-slate-400 pl-6">
                      <p><strong className="text-slate-300">Expected:</strong> {test.expected}</p>
                      <p><strong className="text-slate-300">Actual:</strong> {test.actual}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0E1322] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold font-sans transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
