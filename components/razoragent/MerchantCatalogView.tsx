'use client';

import React, { useState } from 'react';
import { Package, Tag, Star, ShieldCheck, ToggleLeft, ToggleRight, Sparkles, Check, Edit2, ArrowRight } from 'lucide-react';
import { MERCHANT_CATALOG, AVAILABLE_COUPONS } from '@/lib/razoragent/catalog-data';
import { ProductItem } from '@/lib/razoragent/types';

interface MerchantCatalogViewProps {
  onSelectProductToTest?: (productName: string) => void;
}

export default function MerchantCatalogView({ onSelectProductToTest }: MerchantCatalogViewProps) {
  const [catalog, setCatalog] = useState<ProductItem[]>(MERCHANT_CATALOG);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const toggleStock = (id: string) => {
    setCatalog((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: item.stock > 0 ? 0 : 15 } : item))
    );
  };

  const startEditPrice = (item: ProductItem) => {
    setEditingId(item.id);
    setTempPrice(item.price);
  };

  const savePrice = (id: string) => {
    setCatalog((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: tempPrice } : item))
    );
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Coupon strip */}
      <div className="p-4 rounded-2xl bg-[#0E1322] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <Package className="w-5 h-5 text-[#3395FF]" />
          <div>
            <h3 className="text-sm font-bold text-white">Interactive Merchant Storefront & MCP Catalog</h3>
            <p className="text-xs text-slate-400">Manage real-time prices & stock. AI shopping agents dynamically discover these live changes via MCP tools.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Promo Coupons:</span>
          {Object.keys(AVAILABLE_COUPONS).slice(0, 3).map((c) => (
            <span key={c} className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#142238] text-[#3395FF] border border-[#0C8CE9]/30 flex items-center gap-1">
              <Tag className="w-3 h-3" /> {c}
            </span>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {catalog.map((product) => {
          const isOutOfStock = product.stock === 0;

          return (
            <div
              key={product.id}
              className={`bg-[#0B0F19] border rounded-2xl overflow-hidden shadow-lg transition flex flex-col ${
                isOutOfStock ? 'border-rose-900/40 opacity-75' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="h-40 w-full relative bg-slate-900 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition duration-300"
                />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md text-slate-300 border border-white/10 uppercase">
                  {product.category}
                </span>

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-900/80 text-rose-200 text-xs font-mono font-bold border border-rose-700">
                      OUT OF STOCK (Agent Blocked)
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center space-x-1 text-amber-400 text-xs font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold">{product.rating}</span>
                    <span className="text-slate-500 text-[10px]">({product.reviewCount})</span>
                  </div>
                  <h4 className="font-semibold text-white text-xs mt-1 line-clamp-2 leading-snug">
                    {product.name}
                  </h4>
                </div>

                {/* Price & Stock Controls */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">Price:</span>
                      {editingId === product.id ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(Number(e.target.value))}
                            className="w-20 px-1.5 py-0.5 bg-[#121624] border border-[#0C8CE9] rounded text-white text-xs font-mono"
                          />
                          <button
                            onClick={() => savePrice(product.id)}
                            className="p-1 bg-[#0C8CE9] text-white rounded hover:bg-[#0972BD]"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 group cursor-pointer" onClick={() => startEditPrice(product)}>
                          <span className="text-sm font-bold text-white font-mono">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-[#3395FF] transition" />
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-mono block">Inventory:</span>
                      <button
                        onClick={() => toggleStock(product.id)}
                        className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                          isOutOfStock
                            ? 'bg-rose-950 text-rose-400 border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        }`}
                      >
                        {isOutOfStock ? '0 in stock' : `${product.stock} in stock`}
                      </button>
                    </div>
                  </div>

                  {onSelectProductToTest && (
                    <button
                      onClick={() => onSelectProductToTest(product.name)}
                      className="w-full py-1.5 px-2 rounded-lg bg-[#141C30] hover:bg-[#1A2642] border border-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center justify-center space-x-1 transition"
                    >
                      <Sparkles className="w-3 h-3 text-[#3395FF]" />
                      <span>Test with AI Agent</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
