'use client';

import React from 'react';
import { Zap, Activity, Github, Layers, Bot, Sliders, TrendingUp } from 'lucide-react';

export type DashboardTab = 'buyer-studio' | 'catalog' | 'guardrails' | 'analytics';

interface NavbarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onRunBenchmarks: () => void;
  benchmarksLoading?: boolean;
}

export default function Navbar({ activeTab, onTabChange, onRunBenchmarks, benchmarksLoading }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#090C15]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0C8CE9] to-[#3395FF] flex items-center justify-center shadow-lg shadow-[#0C8CE9]/25">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">Razor<span className="text-[#3395FF]">Agent</span></span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#0C8CE9]/20 text-[#3395FF] border border-[#0C8CE9]/30">
                MCP GATEWAY
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800">
            <button
              onClick={() => onTabChange('buyer-studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'buyer-studio'
                  ? 'bg-[#121E33] text-[#3395FF] border border-[#0C8CE9]/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1322]'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Buyer Studio</span>
            </button>

            <button
              onClick={() => onTabChange('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-[#121E33] text-[#3395FF] border border-[#0C8CE9]/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1322]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Store Catalog</span>
            </button>

            <button
              onClick={() => onTabChange('guardrails')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'guardrails'
                  ? 'bg-[#121E33] text-[#3395FF] border border-[#0C8CE9]/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1322]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Guardrails</span>
            </button>

            <button
              onClick={() => onTabChange('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-[#121E33] text-[#3395FF] border border-[#0C8CE9]/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1322]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onRunBenchmarks}
            disabled={benchmarksLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141C2E] hover:bg-[#1A263E] text-slate-300 border border-slate-700 transition"
          >
            <Activity className={`w-3.5 h-3.5 text-[#3395FF] ${benchmarksLoading ? 'animate-spin' : ''}`} />
            <span>{benchmarksLoading ? 'Running...' : 'Run Tests'}</span>
          </button>

          <a
            href="https://github.com/Piyush-Thakur7/razoragent"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0C8CE9] hover:bg-[#0972BD] text-white shadow-md shadow-[#0C8CE9]/20 transition"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>

      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden px-4 py-2 border-t border-slate-800/80 bg-[#0A0D16] overflow-x-auto space-x-1">
        <button
          onClick={() => onTabChange('buyer-studio')}
          className={`px-2.5 py-1 text-[11px] rounded-lg font-medium shrink-0 ${
            activeTab === 'buyer-studio' ? 'bg-[#121E33] text-[#3395FF]' : 'text-slate-400'
          }`}
        >
          AI Studio
        </button>
        <button
          onClick={() => onTabChange('catalog')}
          className={`px-2.5 py-1 text-[11px] rounded-lg font-medium shrink-0 ${
            activeTab === 'catalog' ? 'bg-[#121E33] text-[#3395FF]' : 'text-slate-400'
          }`}
        >
          Catalog
        </button>
        <button
          onClick={() => onTabChange('guardrails')}
          className={`px-2.5 py-1 text-[11px] rounded-lg font-medium shrink-0 ${
            activeTab === 'guardrails' ? 'bg-[#121E33] text-[#3395FF]' : 'text-slate-400'
          }`}
        >
          Guardrails
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`px-2.5 py-1 text-[11px] rounded-lg font-medium shrink-0 ${
            activeTab === 'analytics' ? 'bg-[#121E33] text-[#3395FF]' : 'text-slate-400'
          }`}
        >
          Analytics
        </button>
      </div>

    </header>
  );
}
