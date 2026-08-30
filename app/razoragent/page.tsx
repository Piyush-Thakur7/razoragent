'use client';

import React, { useState } from 'react';
import Navbar, { DashboardTab } from '@/components/razoragent/Navbar';
import AgentTerminal from '@/components/razoragent/AgentTerminal';
import PolicyInspector from '@/components/razoragent/PolicyInspector';
import OrderReceiptCard from '@/components/razoragent/OrderReceiptCard';
import MerchantCatalogView from '@/components/razoragent/MerchantCatalogView';
import MerchantAnalytics from '@/components/razoragent/MerchantAnalytics';
import BenchmarkModal from '@/components/razoragent/BenchmarkModal';
import RazorpayCheckoutModal from '@/components/razoragent/RazorpayCheckoutModal';
import IntegrationDocsModal from '@/components/razoragent/IntegrationDocsModal';
import ConnectStoreModal from '@/components/razoragent/ConnectStoreModal';
import WebhookStream, { WebhookEventItem } from '@/components/razoragent/WebhookStream';
import { GuardrailPolicyConfig, SimulationResult, TestResult } from '@/lib/razoragent/types';

export default function RazorAgentPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('buyer-studio');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ verified: boolean; status: string; signature?: string } | null>(null);

  // Razorpay Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Integration Docs Modal
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Merchant Connect Store Modal & Status
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [liveStoreName, setLiveStoreName] = useState<string | null>(null);

  // Live Webhook Events
  const [webhookEvents, setWebhookEvents] = useState<WebhookEventItem[]>([
    {
      id: 'evt_init_8921',
      eventType: 'policy.evaluated',
      timestamp: new Date(Date.now() - 1000 * 120).toISOString(),
      signature: 'hmac_sha256_d89f2a78103c8b1',
      verified: true,
      payload: {
        guardrail: 'DETERMINISTIC_SPEND_CAP',
        maxLimitINR: 5000,
        status: 'ACTIVE',
      },
    },
  ]);

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

      // Add live webhook events for this execution
      if (data.order) {
        const newEvents: WebhookEventItem[] = [
          {
            id: `evt_ord_${Math.random().toString(36).substring(2, 8)}`,
            eventType: 'order.created',
            timestamp: new Date().toISOString(),
            signature: `hmac_sha256_${Math.random().toString(36).substring(2, 14)}`,
            verified: true,
            payload: {
              orderId: data.order.id,
              amount: data.order.amount,
              currency: 'INR',
              agentId: 'agent_buyer_01',
              idempotencyLock: 'LOCKED',
            },
          },
        ];
        setWebhookEvents((prev) => [...newEvents, ...prev]);
      }
    } catch (err) {
      console.error('Agent simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (orderId: string, paymentId: string, signature: string) => {
    try {
      const res = await fetch('/api/razoragent/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, payment_id: paymentId, signature }),
      });

      const data = await res.json();
      setVerificationResult(data);

      // Dispatch Webhook event
      const captureEvent: WebhookEventItem = {
        id: `evt_pay_${Math.random().toString(36).substring(2, 8)}`,
        eventType: 'payment.captured',
        timestamp: new Date().toISOString(),
        signature: data.signature || signature,
        verified: data.verified,
        payload: {
          orderId,
          paymentId,
          status: 'CAPTURED_AND_SETTLED',
          method: 'UPI_STANDARD',
          feePaise: Math.round(Number(simulationResult?.finalCart?.totalAmount || 0) * 2),
        },
      };
      setWebhookEvents((prev) => [captureEvent, ...prev]);
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

  const handleSelectProductToTest = (productName: string) => {
    setActiveTab('buyer-studio');
    handleRunSimulation(`Find and purchase ${productName} with eligible discount coupon`);
  };

  return (
    <div className="min-h-screen bg-[#07090F] text-slate-100 font-sans antialiased selection:bg-[#0C8CE9] selection:text-white flex flex-col">
      {/* Navbar with Section Tabs */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRunBenchmarks={handleRunBenchmarks}
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenConnectStore={() => setIsConnectOpen(true)}
        liveStoreName={liveStoreName}
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
                liveStoreName={liveStoreName}
                onOpenConnectStore={() => setIsConnectOpen(true)}
              />
            </div>

            {/* Right Settlement Card & Live Webhook (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <OrderReceiptCard
                order={simulationResult?.order || null}
                cart={simulationResult?.finalCart || null}
                onOpenCheckoutModal={() => setIsCheckoutOpen(true)}
                verificationResult={verificationResult}
              />

              <WebhookStream events={webhookEvents} />
            </div>
          </div>
        )}

        {/* Tab 2: Store Catalog */}
        {activeTab === 'catalog' && (
          <MerchantCatalogView onSelectProductToTest={handleSelectProductToTest} />
        )}

        {/* Tab 3: Guardrails Config */}
        {activeTab === 'guardrails' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <PolicyInspector onConfigChange={handlePolicyConfigChange} />
            <WebhookStream events={webhookEvents} />
          </div>
        )}

        {/* Tab 4: Analytics */}
        {activeTab === 'analytics' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <MerchantAnalytics />
            <WebhookStream events={webhookEvents} />
          </div>
        )}

      </main>

      {/* Connect Store Modal */}
      <ConnectStoreModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onStoreConnected={(name, isLive) => {
          setLiveStoreName(isLive ? name : null);
        }}
      />

      {/* Razorpay Standard Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        order={simulationResult?.order || null}
        cart={simulationResult?.finalCart || null}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Merchant Integration Guide Modal */}
      <IntegrationDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      {/* Footer with Resence Branding */}
      <footer className="border-t border-slate-900 bg-[#06080E] py-4 text-center text-slate-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-white font-bold">RazorAgent</span>
            <span className="text-slate-400">by</span>
            <span className="text-[#3395FF] font-extrabold tracking-wider">RESENCE</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Engineered by Piyush Singh · Enterprise MCP Commerce Gateway
          </p>
        </div>
      </footer>

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
