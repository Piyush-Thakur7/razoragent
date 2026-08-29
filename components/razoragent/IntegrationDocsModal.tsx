'use client';

import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface IntegrationDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IntegrationDocsModal({ isOpen, onClose }: IntegrationDocsModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const NEXTJS_SNIPPET = `// app/api/razoragent/mcp/route.ts
import { handleMCPRequest } from '@razorpay/razoragent';

export async function POST(req: Request) {
  const jsonRpcBody = await req.json();
  
  // 1. Dispatch MCP JSON-RPC with merchant guardrails
  const response = await handleMCPRequest(jsonRpcBody, {
    maxSpendPerTransactionINR: 5000,
    allowedCategories: ['electronics', 'apparel', 'specialty-coffee'],
    maxQuantityPerSKU: 3
  });

  return Response.json(response);
}`;

  const CLAUDE_CONFIG_SNIPPET = `// claude_desktop_config.json
{
  "mcpServers": {
    "razorpay-merchant": {
      "command": "npx",
      "args": ["-y", "@razorpay/razoragent-mcp", "--endpoint", "https://your-domain.com/api/razoragent/mcp"]
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#0B0F19] border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0E1322] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#0C8CE9]/20 text-[#3395FF]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Merchant SDK & Integration Guide</h3>
              <p className="text-xs text-slate-400">Connect your store to Razorpay Agentic Commerce in 2 minutes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          
          {/* Step 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0C8CE9] text-white flex items-center justify-center text-[10px]">1</span>
                Install Gateway Package
              </span>
              <button
                onClick={() => copyCode('npm', 'npm install @razorpay/razoragent')}
                className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
              >
                {copiedSection === 'npm' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#04060A] border border-slate-800 font-mono text-slate-200">
              npm install @razorpay/razoragent
            </pre>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0C8CE9] text-white flex items-center justify-center text-[10px]">2</span>
                Expose MCP Endpoint in Next.js / Node.js
              </span>
              <button
                onClick={() => copyCode('next', NEXTJS_SNIPPET)}
                className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
              >
                {copiedSection === 'next' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#04060A] border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto">
              {NEXTJS_SNIPPET}
            </pre>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0C8CE9] text-white flex items-center justify-center text-[10px]">3</span>
                Connect External AI Agents (Claude / Gemini / Operator)
              </span>
              <button
                onClick={() => copyCode('claude', CLAUDE_CONFIG_SNIPPET)}
                className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
              >
                {copiedSection === 'claude' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#04060A] border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto">
              {CLAUDE_CONFIG_SNIPPET}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0E1322] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
