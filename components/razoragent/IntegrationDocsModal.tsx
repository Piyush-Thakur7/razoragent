'use client';

import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal, Download, FileText, CheckCircle2, Layers, ShieldCheck, ArrowDownToLine, Zap } from 'lucide-react';

interface IntegrationDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IntegrationDocsModal({ isOpen, onClose }: IntegrationDocsModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeFramework, setActiveFramework] = useState<'nextjs' | 'express' | 'claude'>('nextjs');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const NEXTJS_SNIPPET = `// app/api/razoragent/mcp/route.ts
import { handleMCPRequest } from 'razoragent';

export async function POST(req: Request) {
  const jsonRpcBody = await req.json();
  
  // 1. Dispatch MCP JSON-RPC with merchant guardrails
  const response = await handleMCPRequest(jsonRpcBody, {
    maxSpendLimitINR: 5000,
    allowedCategories: ['electronics', 'apparel', 'specialty-coffee'],
    maxQuantityPerItem: 3,
    requireHumanApprovalAboveINR: 10000,
    idempotencyWindowSeconds: 60
  });

  return Response.json(response);
}`;

  const EXPRESS_SNIPPET = `// server.js (Express.js)
const express = require('express');
const { handleMCPRequest } = require('razoragent');

const app = express();
app.use(express.json());

app.post('/api/razoragent/mcp', async (req, res) => {
  const response = await handleMCPRequest(req.body, {
    maxSpendLimitINR: 5000,
    allowedCategories: ['electronics', 'apparel', 'specialty-coffee'],
    maxQuantityPerItem: 3
  });
  res.json(response);
});

app.listen(3000, () => console.log('RazorAgent MCP Gateway live on port 3000'));`;

  const CLAUDE_CONFIG_SNIPPET = `// claude_desktop_config.json
{
  "mcpServers": {
    "razorpay-merchant": {
      "command": "npx",
      "args": [
        "-y",
        "@razorpay/razoragent-mcp",
        "--endpoint",
        "https://razoragent.resence.in/api/razoragent/mcp"
      ]
    }
  }
}`;

  const FULL_DOCS_MARKDOWN = `# ⚡ RazorAgent: Merchant Integration & Deployment Handbook

This guide outlines how to integrate RazorAgent into any e-commerce merchant platform to enable autonomous AI shopping agents to discover products and transact via Razorpay with deterministic guardrails.

---

## 📦 1. Installation

\`\`\`bash
npm install @razorpay/razoragent
\`\`\`

---

## 🛠️ 2. Next.js App Router Route Handler (\`app/api/razoragent/mcp/route.ts\`)

\`\`\`typescript
${NEXTJS_SNIPPET}
\`\`\`

---

## 🛡️ 3. Environment Variables (\`.env.local\`)

\`\`\`env
# Live Razorpay Test Credentials (from dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_yourKeyIdHere
RAZORPAY_KEY_SECRET=yourKeySecretHere
\`\`\`

---

## 🤖 4. Connecting AI Clients (Claude Desktop / Gemini / OpenAI Operator)

Add this to your \`claude_desktop_config.json\`:

\`\`\`json
${CLAUDE_CONFIG_SNIPPET}
\`\`\`

---

## 🧪 5. Automated Verification

\`\`\`bash
npx tsx scripts/test-razoragent.ts
\`\`\`

Generated via RazorAgent Mission Control © 2026 Piyush Singh.`;

  const handleDownloadDocs = () => {
    const blob = new Blob([FULL_DOCS_MARKDOWN], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'RazorAgent-Merchant-Integration-Guide.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#0B0F19] border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0E1322] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#0C8CE9]/20 text-[#3395FF]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Merchant SDK & Installation Guide</h3>
              <p className="text-xs text-slate-400">Step-by-step instructions to connect your store with Razorpay Agentic Commerce</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Framework Selector & Download Strip */}
        <div className="px-6 py-3 bg-[#080B14] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveFramework('nextjs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeFramework === 'nextjs'
                  ? 'bg-[#121E33] text-[#3395FF] border border-[#0C8CE9]/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Next.js 14/15/16
            </button>

            <button
              onClick={() => setActiveFramework('express')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeFramework === 'express'
                  ? 'bg-[#121E33] text-[#3395FF] border border-[#0C8CE9]/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Express / Node.js
            </button>

            <button
              onClick={() => setActiveFramework('claude')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeFramework === 'claude'
                  ? 'bg-[#121E33] text-[#3395FF] border border-[#0C8CE9]/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Claude Desktop MCP
            </button>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownloadDocs}
            className="px-3 py-1.5 rounded-lg bg-[#0C8CE9] hover:bg-[#0972BD] text-white text-xs font-bold font-sans flex items-center space-x-1.5 transition shadow-md shadow-[#0C8CE9]/20"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Downloaded (.md)</span>
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>Download Guide (.md)</span>
              </>
            )}
          </button>

        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          
          {/* Step 1: Package install */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0C8CE9] text-white flex items-center justify-center text-[10px]">1</span>
                Install Gateway Package
              </span>
              <button
                onClick={() => copyCode('npm', 'npm install razoragent')}
                className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
              >
                {copiedSection === 'npm' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#04060A] border border-slate-800 font-mono text-slate-200">
              npm install razoragent
            </pre>
          </div>

          {/* Step 2: Code integration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0C8CE9] text-white flex items-center justify-center text-[10px]">2</span>
                {activeFramework === 'nextjs' && 'Expose MCP Route Handler (Next.js)'}
                {activeFramework === 'express' && 'Mount MCP Endpoint (Express.js)'}
                {activeFramework === 'claude' && 'Configure Claude Desktop JSON'}
              </span>
              <button
                onClick={() => {
                  const code = activeFramework === 'nextjs' ? NEXTJS_SNIPPET : activeFramework === 'express' ? EXPRESS_SNIPPET : CLAUDE_CONFIG_SNIPPET;
                  copyCode('activeCode', code);
                }}
                className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
              >
                {copiedSection === 'activeCode' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#04060A] border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto">
              {activeFramework === 'nextjs' && NEXTJS_SNIPPET}
              {activeFramework === 'express' && EXPRESS_SNIPPET}
              {activeFramework === 'claude' && CLAUDE_CONFIG_SNIPPET}
            </pre>
          </div>

          {/* Step 3: Configure Razorpay Keys */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0C8CE9] text-white flex items-center justify-center text-[10px]">3</span>
                Add Razorpay Credentials (.env.local)
              </span>
              <button
                onClick={() => copyCode('env', 'RAZORPAY_KEY_ID=rzp_test_xxx\nRAZORPAY_KEY_SECRET=your_secret_xxx')}
                className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
              >
                {copiedSection === 'env' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#04060A] border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto">
              RAZORPAY_KEY_ID=rzp_test_yourKeyId&#10;RAZORPAY_KEY_SECRET=yourKeySecret
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0E1322] border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3395FF]" />
            <span>Deterministic SHA-256 Idempotency Enabled</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
