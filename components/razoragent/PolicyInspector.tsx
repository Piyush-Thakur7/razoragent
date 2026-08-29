'use client';

import React, { useState } from 'react';
import { Sliders, Shield, Tag, DollarSign, Check, Info, Plus, X } from 'lucide-react';
import { GuardrailPolicyConfig, ProductCategory } from '@/lib/razoragent/types';

interface PolicyInspectorProps {
  onConfigChange: (config: GuardrailPolicyConfig) => void;
}

export default function PolicyInspector({ onConfigChange }: PolicyInspectorProps) {
  const [maxSpend, setMaxSpend] = useState<number>(5000);
  const [maxQuantity, setMaxQuantity] = useState<number>(3);
  const [categories, setCategories] = useState<ProductCategory[]>([
    'electronics',
    'specialty-coffee',
    'wellness',
    'apparel',
    'home-office',
  ]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const triggerUpdate = (newSpend: number, newQty: number, newCats: ProductCategory[]) => {
    setIsSaved(true);
    onConfigChange({
      maxSpendLimitINR: newSpend,
      maxQuantityPerItem: newQty,
      allowedCategories: newCats,
      requireHumanApprovalAboveINR: 10000,
      idempotencyWindowSeconds: 60,
    });
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSpendChange = (val: number) => {
    setMaxSpend(val);
    triggerUpdate(val, maxQuantity, categories);
  };

  const handleQuantityChange = (val: number) => {
    setMaxQuantity(val);
    triggerUpdate(maxSpend, val, categories);
  };

  const toggleCategory = (cat: ProductCategory) => {
    const nextCats = categories.includes(cat)
      ? categories.filter((c) => c !== cat)
      : [...categories, cat];
    setCategories(nextCats);
    triggerUpdate(maxSpend, maxQuantity, nextCats);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryInput.trim().toLowerCase() as ProductCategory;
    if (!trimmed || categories.includes(trimmed)) return;
    const next = [...categories, trimmed];
    setCategories(next);
    setNewCategoryInput('');
    triggerUpdate(maxSpend, maxQuantity, next);
  };

  return (
    <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#0C8CE9]/20 text-[#3395FF]">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide uppercase">Merchant Financial Guardrails</h4>
            <p className="text-[10px] text-slate-400">Deterministic bounds evaluated before orders reach Razorpay APIs</p>
          </div>
        </div>

        {isSaved && (
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 animate-fade-in">
            <Check className="w-3 h-3" /> Saved Live
          </span>
        )}
      </div>

      {/* Spend Limit: Slider + Direct Manual Number Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-[#3395FF]" /> Max Autonomous Spend Limit:
          </span>
          <div className="flex items-center space-x-1">
            <span className="text-slate-400 font-mono text-xs">₹</span>
            <input
              type="number"
              value={maxSpend}
              onChange={(e) => handleSpendChange(Number(e.target.value))}
              className="w-24 px-2 py-1 bg-[#121624] border border-slate-700 focus:border-[#0C8CE9] rounded-lg text-white font-mono font-bold text-right text-xs focus:outline-none"
              placeholder="e.g. 5000"
            />
          </div>
        </div>

        <input
          type="range"
          min="500"
          max="30000"
          step="500"
          value={maxSpend}
          onChange={(e) => handleSpendChange(Number(e.target.value))}
          className="w-full accent-[#0C8CE9] bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>₹500 (Strict)</span>
          <span>₹10,000 (Default)</span>
          <span>₹30,000 (Enterprise)</span>
        </div>
      </div>

      {/* Max Quantity per SKU: Manual input + quick buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-amber-400" /> Max Quantity per SKU:
          </span>
          <input
            type="number"
            min="1"
            max="100"
            value={maxQuantity}
            onChange={(e) => handleQuantityChange(Number(e.target.value))}
            className="w-16 px-2 py-1 bg-[#121624] border border-slate-700 focus:border-[#0C8CE9] rounded-lg text-white font-mono font-bold text-center text-xs focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
          {[1, 2, 3, 5, 10].map((qty) => (
            <button
              key={qty}
              onClick={() => handleQuantityChange(qty)}
              className={`py-1 rounded-lg border text-center transition ${
                maxQuantity === qty
                  ? 'bg-[#142238] border-[#0C8CE9] text-[#3395FF] font-bold'
                  : 'bg-[#0E1322] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {qty}
            </button>
          ))}
        </div>
      </div>

      {/* Category Whitelist + Custom Category Input */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium">Approved Merchant Categories:</span>
          <span className="text-[10px] text-slate-500 font-mono">({categories.length} active)</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-[#121E33] text-[#3395FF] border border-[#0C8CE9]/30 hover:border-rose-500 hover:text-rose-300 transition flex items-center gap-1 group"
              title="Click to remove category"
            >
              <span>{cat}</span>
              <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
            </button>
          ))}
        </div>

        {/* Add custom category */}
        <form onSubmit={handleAddCategory} className="flex gap-1.5 pt-1">
          <input
            type="text"
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            placeholder="Add category (e.g. books, furniture)..."
            className="flex-1 px-2.5 py-1 bg-[#080B14] border border-slate-800 rounded-lg text-slate-200 text-xs font-mono focus:border-[#0C8CE9] focus:outline-none"
          />
          <button
            type="submit"
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </form>
      </div>

    </div>
  );
}
