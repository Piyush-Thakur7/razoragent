'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sliders, AlertTriangle, Layers, Lock, RefreshCw } from 'lucide-react';
import { GuardrailPolicyConfig, ProductCategory } from '@/lib/razoragent/types';

interface PolicyInspectorProps {
  onConfigChange?: (newConfig: GuardrailPolicyConfig) => void;
}

const ALL_CATEGORIES: ProductCategory[] = [
  'electronics',
  'specialty-coffee',
  'wellness',
  'apparel',
  'home-office',
  'software-licenses',
];

export default function PolicyInspector({ onConfigChange }: PolicyInspectorProps) {
  const [spendLimit, setSpendLimit] = useState<number>(5000);
  const [maxQty, setMaxQty] = useState<number>(3);
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([
    'electronics',
    'specialty-coffee',
    'wellness',
    'apparel',
    'home-office',
  ]);
  const [isSaved, setIsSaved] = useState(false);

  const toggleCategory = (cat: ProductCategory) => {
    let updated: ProductCategory[];
    if (selectedCategories.includes(cat)) {
      updated = selectedCategories.filter((c) => c !== cat);
    } else {
      updated = [...selectedCategories, cat];
    }
    setSelectedCategories(updated);
    emitUpdate(spendLimit, maxQty, updated);
  };

  const handleSpendChange = (val: number) => {
    setSpendLimit(val);
    emitUpdate(val, maxQty, selectedCategories);
  };

  const handleQtyChange = (val: number) => {
    setMaxQty(val);
    emitUpdate(spendLimit, val, selectedCategories);
  };

  const emitUpdate = (limit: number, qty: number, categories: ProductCategory[]) => {
    const config: GuardrailPolicyConfig = {
      maxSpendLimitINR: limit,
      allowedCategories: categories,
      maxQuantityPerItem: qty,
      requireHumanApprovalAboveINR: limit * 2,
      idempotencyWindowSeconds: 60,
    };
    if (onConfigChange) {
      onConfigChange(config);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#0C8CE9]/20 text-[#3395FF]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">Deterministic Policy Engine</h3>
            <p className="text-[10px] text-slate-400">Hard mathematical bounds evaluated before Razorpay APIs</p>
          </div>
        </div>
        {isSaved && (
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 animate-fade-in">
            Policies Synced
          </span>
        )}
      </div>

      {/* Spend Cap Control */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#3395FF]" /> Max Autonomous Spend Limit:
          </span>
          <span className="font-mono font-bold text-base text-[#3395FF]">
            ₹{spendLimit.toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min="1000"
          max="25000"
          step="500"
          value={spendLimit}
          onChange={(e) => handleSpendChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0C8CE9]"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>₹1,000 (Strict)</span>
          <span>₹10,000 (Default)</span>
          <span>₹25,000 (Enterprise)</span>
        </div>
      </div>

      {/* Max Quantity Control */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" /> Max Quantity per SKU:
          </span>
          <span className="font-mono font-bold text-sm text-amber-400">
            {maxQty} units max
          </span>
        </div>
        <div className="flex space-x-2">
          {[1, 2, 3, 5, 10].map((qty) => (
            <button
              key={qty}
              onClick={() => handleQtyChange(qty)}
              className={`flex-1 py-1 text-xs font-mono rounded-lg border transition ${
                maxQty === qty
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                  : 'bg-[#121829] text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {qty}
            </button>
          ))}
        </div>
      </div>

      {/* Category Gating */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-purple-400" /> Autonomous Merchant Category Whitelist:
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {ALL_CATEGORIES.map((cat) => {
            const isChecked = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`text-left px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition flex items-center justify-between ${
                  isChecked
                    ? 'bg-[#121E33] text-[#3395FF] border-[#0C8CE9]/40'
                    : 'bg-[#0E121B] text-slate-500 border-slate-800/80 line-through opacity-60'
                }`}
              >
                <span className="truncate">{cat}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-[#3395FF]' : 'bg-slate-700'}`}></span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
