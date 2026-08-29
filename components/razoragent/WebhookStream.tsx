'use client';

import React, { useState } from 'react';
import { Radio, ShieldCheck, CheckCircle2, ChevronRight, ChevronDown, Copy, Check, Terminal } from 'lucide-react';

export interface WebhookEventItem {
  id: string;
  eventType: 'order.created' | 'payment.authorized' | 'payment.captured' | 'policy.evaluated' | 'idempotency.locked';
  timestamp: string;
  signature: string;
  verified: boolean;
  payload: Record<string, unknown>;
}

interface WebhookStreamProps {
  events: WebhookEventItem[];
}

export default function WebhookStream({ events }: WebhookStreamProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#0C8CE9]/20 text-[#3395FF]">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">Fintech Event Stream & Webhooks</h3>
            <p className="text-[10px] text-slate-400">Cryptographically signed webhook event dispatch & audit trail</p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          HMAC-SHA256 SIGNED
        </span>
      </div>

      {/* Stream List */}
      <div className="space-y-2 font-mono text-xs max-h-80 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <Terminal className="w-6 h-6 mx-auto text-slate-600 mb-2" />
            <p>No webhook events yet.</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Execute an agent checkout or settlement to see live webhooks stream.</p>
          </div>
        ) : (
          events.map((evt) => {
            const isExpanded = expandedId === evt.id;

            return (
              <div
                key={evt.id}
                className="p-3 rounded-xl bg-[#080B14] border border-slate-800/80 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#121E33] text-[#3395FF] border border-[#0C8CE9]/30">
                      {evt.eventType}
                    </span>
                    <span className="text-slate-400 text-[11px] font-semibold">{evt.id}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1 font-bold">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/40">
                  <span className="truncate max-w-[280px]">Sig: {evt.signature}</span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(evt.id, JSON.stringify(evt.payload, null, 2))}
                      className="text-slate-500 hover:text-slate-300 transition flex items-center gap-1"
                    >
                      {copiedId === evt.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                      className="text-[#3395FF] hover:underline flex items-center gap-0.5"
                    >
                      <span>{isExpanded ? 'Hide' : 'Payload'}</span>
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <pre className="mt-2 p-2.5 rounded-lg bg-[#04060A] border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
                    {JSON.stringify(evt.payload, null, 2)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
