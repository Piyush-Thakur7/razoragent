'use client';

import React, { useState } from 'react';
import { Terminal, Send, Sparkles, CheckCircle2, ChevronDown, ChevronRight, Clock, ShieldAlert, Cpu, ArrowRight, Layers, ShieldCheck, Zap } from 'lucide-react';
import { AgentSimulationStep, SimulationResult } from '@/lib/razoragent/types';

interface AgentTerminalProps {
  onRunSimulation: (prompt: string) => Promise<void>;
  isLoading: boolean;
  simulationResult: SimulationResult | null;
  liveStoreName?: string | null;
  onOpenConnectStore?: () => void;
}

const PRESET_PROMPTS = [
  {
    label: '🟢 Happy Path Checkout',
    prompt: 'Find me a Keychron mechanical keyboard under ₹4,000 and complete checkout with coupon AGENT500',
    desc: 'Full flow: Catalog → Quote → Guardrail → Razorpay Order',
  },
  {
    label: '🔴 Trigger Budget Guardrail',
    prompt: 'Buy Sony WH-1000XM5 active noise cancelling headphones for ₹18,990',
    desc: 'Exceeds autonomous ₹5,000 spend cap → Blocked with reason code',
  },
  {
    label: '🟡 Trigger Quantity Guardrail',
    prompt: 'Order 8 units of Blue Tokai coffee beans with discount coupon COFFEE100',
    desc: 'Exceeds max 3 units/item safety limit → SKU hoarding blocked',
  },
  {
    label: '🟢 Running Shoes (Apparel)',
    prompt: 'Buy Puma everyday lightweight running shoes under ₹2,000',
    desc: 'Apparel category with dynamic GST calculation & shipping validation',
  },
  {
    label: '🟢 Travel Tech Backpack',
    prompt: 'Get me an Aer travel carry-on backpack with coupon TRAVEL15',
    desc: 'Bags category: 15% discount evaluation and guardrail limit check',
  },
  {
    label: '🟢 Specialty Coffee',
    prompt: 'Order Blue Tokai specialty coffee roast beans with coupon COFFEE100',
    desc: 'Specialty coffee single origin beans with coupon deduction',
  },
];

export default function AgentTerminal({ onRunSimulation, isLoading, simulationResult, liveStoreName, onOpenConnectStore }: AgentTerminalProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

  const isLive = Boolean(liveStoreName && !liveStoreName.includes('Demo'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;
    onRunSimulation(inputPrompt.trim());
  };

  const handleSelectPreset = (prompt: string) => {
    setInputPrompt(prompt);
    onRunSimulation(prompt);
  };

  const toggleStepExpand = (index: number) => {
    setExpandedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const getPhaseBadge = (phase: AgentSimulationStep['phase']) => {
    switch (phase) {
      case 'PERCEPTION':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">PERCEPTION</span>;
      case 'TOOL_CALL':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">MCP TOOL</span>;
      case 'POLICY_GATE':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">POLICY GATE</span>;
      case 'SETTLEMENT':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">RAZORPAY SETTLEMENT</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-700 text-slate-300">STEP</span>;
    }
  };

  // Check stage completion for the visual stepper
  const hasPerception = simulationResult?.steps.some((s) => s.phase === 'PERCEPTION');
  const hasTools = simulationResult?.steps.some((s) => s.phase === 'TOOL_CALL');
  const hasPolicy = simulationResult?.steps.some((s) => s.phase === 'POLICY_GATE');
  const hasSettlement = simulationResult?.steps.some((s) => s.phase === 'SETTLEMENT');

  return (
    <div className="flex flex-col h-full bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Header bar */}
      <div className="px-4 py-3 bg-[#0E1322] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
          <div className="h-3.5 w-[1px] bg-slate-700 mx-1"></div>
          <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-[#3395FF]" />
            <span>Autonomous AI Buyer Terminal</span>
          </div>
        </div>

        {/* Honest Catalog Indicator */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div
            className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition ${
              isLive
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>{isLive ? `🟢 LIVE: ${liveStoreName}` : '🟡 DEMO CATALOG (sample data)'}</span>
          </div>

          {onOpenConnectStore && (
            <button
              onClick={onOpenConnectStore}
              className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 hover:text-white transition"
              title="Connect real store"
            >
              Connect
            </button>
          )}

          {simulationResult && (
            <div className="flex items-center space-x-2 text-xs font-mono pl-2 border-l border-slate-800">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {simulationResult.totalDurationMs}ms
              </span>
              {simulationResult.success ? (
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> ORDER CREATED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] bg-rose-950/80 text-rose-400 border border-rose-800 flex items-center gap-1 font-semibold">
                  <ShieldAlert className="w-3 h-3" /> INTERCEPTED
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Visual Pipeline Stepper */}
      <div className="px-4 py-2.5 bg-[#080B14] border-b border-slate-800/80">
        <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
          <div className={`p-1.5 rounded-lg border text-center transition flex items-center justify-center gap-1 ${
            isLoading || hasPerception ? 'bg-purple-950/40 border-purple-800 text-purple-300 font-bold' : 'bg-[#0E1322] border-slate-800 text-slate-500'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span className="truncate">1. Intent</span>
          </div>

          <div className={`p-1.5 rounded-lg border text-center transition flex items-center justify-center gap-1 ${
            hasTools ? 'bg-blue-950/40 border-blue-800 text-[#3395FF] font-bold' : 'bg-[#0E1322] border-slate-800 text-slate-500'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#3395FF]"></span>
            <span className="truncate">2. MCP Tool</span>
          </div>

          <div className={`p-1.5 rounded-lg border text-center transition flex items-center justify-center gap-1 ${
            hasPolicy ? (simulationResult?.policyDecision?.allowed ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 font-bold' : 'bg-rose-950/40 border-rose-800 text-rose-300 font-bold') : 'bg-[#0E1322] border-slate-800 text-slate-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${simulationResult?.policyDecision?.allowed ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <span className="truncate">3. Guardrail</span>
          </div>

          <div className={`p-1.5 rounded-lg border text-center transition flex items-center justify-center gap-1 ${
            hasSettlement ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 font-bold' : 'bg-[#0E1322] border-slate-800 text-slate-500'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="truncate">4. Razorpay</span>
          </div>
        </div>
      </div>

      {/* Preset Badges */}
      <div className="p-3 bg-[#0B0E17] border-b border-slate-800/80">
        <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#3395FF]" />
          <span>Quick Intent Presets (Simulate Real AI Buyer Requests):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_PROMPTS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset.prompt)}
              disabled={isLoading}
              className="text-left p-2 rounded-lg bg-[#121829] hover:bg-[#182138] border border-slate-800 hover:border-[#0C8CE9]/50 transition group"
            >
              <div className="text-xs font-medium text-slate-200 group-hover:text-white flex items-center justify-between">
                <span>{preset.label}</span>
                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-[#3395FF] opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Execution Trace Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs scrollbar-thin">
        {!simulationResult && !isLoading && (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
            <Cpu className="w-10 h-10 text-slate-600 animate-pulse" />
            <div className="max-w-sm">
              <p className="text-slate-300 font-sans font-medium text-sm">Agent Terminal Idle</p>
              <p className="text-slate-500 text-xs mt-1">
                Enter an autonomous buyer prompt or click a preset to see the Model Context Protocol (MCP) tool chain execute in real-time.
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="p-4 rounded-xl bg-[#121829] border border-slate-800 flex items-center space-x-3 text-slate-300">
            <div className="w-4 h-4 rounded-full border-2 border-[#3395FF] border-t-transparent animate-spin"></div>
            <div>
              <p className="font-semibold text-white">AI Buyer Agent Reasoning...</p>
              <p className="text-slate-400 text-[11px]">Discovering merchant MCP tools, validating cart quotes & evaluating policies.</p>
            </div>
          </div>
        )}

        {simulationResult?.steps.map((step: AgentSimulationStep) => {
          const isExpanded = expandedSteps[step.stepIndex] || false;

          return (
            <div
              key={step.stepIndex}
              className={`p-3 rounded-xl border transition ${
                step.phase === 'POLICY_GATE' && step.policyResult && !step.policyResult.allowed
                  ? 'bg-rose-950/20 border-rose-900/40'
                  : step.phase === 'SETTLEMENT'
                  ? 'bg-emerald-950/20 border-emerald-900/40'
                  : 'bg-[#101524] border-slate-800/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 text-[11px]">#{step.stepIndex}</span>
                  {getPhaseBadge(step.phase)}
                  {step.toolCall && (
                    <span className="font-mono text-[#3395FF] font-semibold text-xs">
                      {step.toolCall.name}()
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Thought */}
              <p className="text-slate-300 mt-2 text-xs leading-relaxed font-sans">
                {step.thought}
              </p>

              {/* Expandable JSON Data for Tool Calls */}
              {(step.toolCall || step.toolResult || step.policyResult || step.orderResult) && (
                <div className="mt-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => toggleStepExpand(step.stepIndex)}
                    className="flex items-center space-x-1 text-[11px] text-[#3395FF] hover:underline font-mono"
                  >
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <span>{isExpanded ? 'Hide Protocol Payload' : 'View Protocol JSON Payload'}</span>
                  </button>

                  {isExpanded && (
                    <pre className="mt-2 p-2.5 rounded-lg bg-[#070A11] border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
                      {JSON.stringify(
                        {
                          toolCall: step.toolCall,
                          toolResult: step.toolResult,
                          policyResult: step.policyResult,
                          orderResult: step.orderResult,
                        },
                        null,
                        2
                      )}
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#0E1322] border-t border-slate-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Instruct AI Buyer Agent (e.g. 'Find mechanical keyboard under ₹4,000')..."
            className="w-full pl-3 pr-24 py-2.5 bg-[#080B14] border border-slate-700 focus:border-[#0C8CE9] rounded-xl text-slate-200 placeholder-slate-500 text-xs font-sans focus:outline-none transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-[#0C8CE9] hover:bg-[#0972BD] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium flex items-center space-x-1 transition shadow"
          >
            <span>Execute</span>
            <Send className="w-3 h-3" />
          </button>
        </div>
      </form>

    </div>
  );
}
