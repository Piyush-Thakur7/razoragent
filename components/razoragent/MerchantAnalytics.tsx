'use client';

import React from 'react';
import { TrendingUp, Bot, ShieldCheck, Activity, Users, Zap } from 'lucide-react';

export default function MerchantAnalytics() {
  return (
    <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">Merchant Growth & GMV Uplift</h3>
            <p className="text-[10px] text-slate-400">Track 1 Signal: Unlocking revenue from autonomous AI buyers</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
          +38.4% Agentic GMV
        </span>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        
        {/* Metric 1 */}
        <div className="p-3 rounded-xl bg-[#0E1322] border border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
            <Bot className="w-3.5 h-3.5 text-[#3395FF]" />
            <span>Agentic Orders</span>
          </div>
          <div className="text-lg font-bold text-white mt-1">1,482</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">+42% this week</div>
        </div>

        {/* Metric 2 */}
        <div className="p-3 rounded-xl bg-[#0E1322] border border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Avg Tool Latency</span>
          </div>
          <div className="text-lg font-bold text-white mt-1">142ms</div>
          <div className="text-[10px] text-slate-400 mt-0.5">JSON-RPC 2.0</div>
        </div>

        {/* Metric 3 */}
        <div className="p-3 rounded-xl bg-[#0E1322] border border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Guardrail Pass %</span>
          </div>
          <div className="text-lg font-bold text-white mt-1">89.6%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">10.4% safely blocked</div>
        </div>

        {/* Metric 4 */}
        <div className="p-3 rounded-xl bg-[#0E1322] border border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Duplicate Rate</span>
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-1">0.00%</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">100% SHA-256 locked</div>
        </div>

      </div>

      {/* Progress Bar of GMV Split */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>Human Shoppers (61.6%)</span>
          <span className="text-[#3395FF] font-bold">Autonomous AI Buyers (38.4%)</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
          <div className="h-full bg-slate-600" style={{ width: '61.6%' }}></div>
          <div className="h-full bg-gradient-to-r from-[#0C8CE9] to-[#3395FF]" style={{ width: '38.4%' }}></div>
        </div>
      </div>

    </div>
  );
}
