'use client';

import React, { useState } from 'react';
import Navbar, { DashboardTab } from '@/components/razoragent/Navbar';
import AgentTerminal from '@/components/razoragent/AgentTerminal';
import PolicyInspector from '@/components/razoragent/PolicyInspector';
import OrderReceiptCard from '@/components/razoragent/OrderReceiptCard';
import MerchantCatalogView from '@/components/razoragent/MerchantCatalogView';
import MerchantAnalytics from '@/components/razoragent/MerchantAnalytics';
import BenchmarkModal from '@/components/razoragent/BenchmarkModal';
import { GuardrailPolicyConfig, SimulationResult, TestResult } from '@/lib/razoragent/types';

export default function RazorAgentPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('buyer-studio');
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
    <div className="min-h-screen bg-[#07090F] text-slate-100 font-sans antialiased selection:bg-[#0C8CE9] selection:text-white flex flex-col">
      {/* Navbar with Section Tabs */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRunBenchmarks={handleRunBenchmarks}
        benchmarksLoading={benchmarkLoading}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        
        {/* Tab 1: AI Buyer Studio */}
        {activeTab === 'buyer-studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Terminal (7 Cols) */}
            <div className="lg:col-span-7 h-[680px]">
              <AgentTerminal
                onRunSimulation={handleRunSimulation}
                isLoading={isLoading}
                simulationResult={simulationResult}
              />
            </div>

            {/* Right Settlement Card & Policies (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <OrderReceiptCard
                order={simulationResult?.order || null}
                cart={simulationResult?.finalCart || null}
                onVerifyPayment={handleVerifyPayment}
                verificationResult={verificationResult}
              />
              <PolicyInspector onConfigChange={handlePolicyConfigChange} />
            </div>
          </div>
        )}

        {/* Tab 2: Store Catalog */}
        {activeTab === 'catalog' && (
          <MerchantCatalogView />
        )}

        {/* Tab 3: Guardrails Config */}
        {activeTab === 'guardrails' && (
          <div className="max-w-3xl mx-auto">
            <PolicyInspector onConfigChange={handlePolicyConfigChange} />
          </div>
        )}

        {/* Tab 4: Analytics */}
        {activeTab === 'analytics' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <MerchantAnalytics />
          </div>
        )}

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
