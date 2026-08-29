'use client';

import React from 'react';
import { ShieldCheck, Cpu, Zap, Github, ExternalLink, Activity } from 'lucide-react';

interface NavbarProps {
  onRunBenchmarks: () => void;
  benchmarksLoading?: boolean;
}

export default function Navbar({ onRunBenchmarks, benchmarksLoading }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#090C15]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Track */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0C8CE9] to-[#3395FF] flex items-center justify-center shadow-lg shadow-[#0C8CE9]/30">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-white text-lg tracking-tight">Razor<span className="text-[#3395FF]">Agent</span></span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#0C8CE9]/20 text-[#3395FF] border border-[#0C8CE9]/30">
                  MCP v1.0
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Bounded Commerce & Settlement Gateway
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Track 01: AI Growth & Agentic Commerce
            </span>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Guardrails: ACTIVE</span>
          </div>

          <button
            onClick={onRunBenchmarks}
            disabled={benchmarksLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#162032] hover:bg-[#1E2D47] text-slate-200 border border-slate-700 transition"
          >
            <Activity className={`w-3.5 h-3.5 text-[#3395FF] ${benchmarksLoading ? 'animate-spin' : ''}`} />
            <span>{benchmarksLoading ? 'Running Tests...' : 'Run Benchmarks'}</span>
          </button>

          <a
            href="https://github.com/Piyush-Thakur7/razoragent"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0C8CE9] hover:bg-[#0972BD] text-white shadow-md shadow-[#0C8CE9]/20 transition"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub Repo</span>
          </a>
        </div>

      </div>
    </header>
  );
}
