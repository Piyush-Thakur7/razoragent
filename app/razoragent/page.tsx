'use client';

import React, { useState } from 'react';
import Navbar from '@/components/razoragent/Navbar';
import AgentTerminal from '@/components/razoragent/AgentTerminal';
import PolicyInspector from '@/components/razoragent/PolicyInspector';
import OrderReceiptCard from '@/components/razoragent/OrderReceiptCard';
import RaceConditionSandbox from '@/components/razoragent/RaceConditionSandbox';
import MerchantAnalytics from '@/components/razoragent/MerchantAnalytics';
import BenchmarkModal from '@/components/razoragent/BenchmarkModal';
import { GuardrailPolicyConfig, SimulationResult, TestResult } from '@/lib/razoragent/types';

export default function RazorAgentPage() {
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ verified: boolean; status: string; signature?: string } | null>(null);

  // Benchmarks Modal state
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<TestResult[] | null>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);

  const handleRunSimulation = async (prompt: string) => {
    setIsLoading(true);
    setVerificationResult(null);

    try {
      const res = await fetch('/api/razoragent/agent/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data: SimulationResult = await res.json();
      setSimulationResult(data);
    } catch (err) {
      console.error('Agent simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId: string, paymentId: string) => {
    try {
      const res = await fetch('/api/razoragent/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, payment_id: paymentId }),
      });

      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      console.error('Payment verification error:', err);
    }
  };

  const handleRunBenchmarks = async () => {
    setIsBenchmarkOpen(true);
    setBenchmarkLoading(true);

    try {
      const res = await fetch('/api/razoragent/test-suite', { method: 'POST' });
      const data = await res.json();
      setBenchmarkResults(data.results);
    } catch (err) {
      console.error('Benchmark execution error:', err);
    } finally {
      setBenchmarkLoading(false);
    }
  };

  const handlePolicyConfigChange = async (newConfig: GuardrailPolicyConfig) => {
    try {
      await fetch('/api/razoragent/guardrails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
    } catch (err) {
      console.error('Policy update error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090F] text-slate-100 font-sans antialiased selection:bg-[#0C8CE9] selection:text-white">
      {/* Navbar */}
      <Navbar onRunBenchmarks={handleRunBenchmarks} benchmarksLoading={benchmarkLoading} />

      {/* Hero Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="bg-gradient-to-r from-[#0C152B] via-[#0E1B38] to-[#0A1020] border border-[#0C8CE9]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          {/* Background Ambient Glow */}
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-[#0C8CE9]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute right-1/3 bottom-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#0C8CE9]/20 text-[#3395FF] border border-[#0C8CE9]/40 tracking-wide uppercase">
                Razorpay AI Buildathon 2026 Submission
              </span>
              <span className="text-xs text-slate-400 font-mono">· Track 01</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Razor<span className="text-[#3395FF]">Agent</span> — Bounded MCP Commerce & Settlement Gateway
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Turning merchant catalogs into standardized Model Context Protocol (MCP) servers so autonomous AI shopping agents can discover, quote, and transact via Razorpay—with hard mathematical guardrails and cryptographic idempotency.
            </p>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Interactive Studio */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: AI Buyer Terminal (7 Cols) */}
          <div className="lg:col-span-7 h-[680px]">
            <AgentTerminal
              onRunSimulation={handleRunSimulation}
              isLoading={isLoading}
              simulationResult={simulationResult}
            />
          </div>

          {/* Right Column: Policy, Razorpay Settlement & 2 AM Crisis (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Razorpay Settlement Card */}
            <OrderReceiptCard
              order={simulationResult?.order || null}
              cart={simulationResult?.finalCart || null}
              onVerifyPayment={handleVerifyPayment}
              verificationResult={verificationResult}
            />

            {/* Policy Inspector */}
            <PolicyInspector onConfigChange={handlePolicyConfigChange} />

            {/* The 2 AM Crisis Simulator */}
            <RaceConditionSandbox />

            {/* Merchant Growth Analytics */}
            <MerchantAnalytics />
          </div>

        </div>
      </main>

      {/* Benchmark Modal */}
      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        results={benchmarkResults}
        isLoading={benchmarkLoading}
        onRerun={handleRunBenchmarks}
      />
    </div>
  );
}
