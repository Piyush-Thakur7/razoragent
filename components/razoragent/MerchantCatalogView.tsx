'use client';

import React from 'react';
import { Package, Tag, Star, ShieldCheck } from 'lucide-react';
import { MERCHANT_CATALOG, AVAILABLE_COUPONS } from '@/lib/razoragent/catalog-data';

export default function MerchantCatalogView() {
  return (
    <div className="space-y-6">
      
      {/* Top Banner / Coupon strip */}
      <div className="p-4 rounded-2xl bg-[#0E1322] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-[#3395FF]" />
          <div>
            <h3 className="text-sm font-bold text-white">Active Merchant Catalog (MCP Indexed)</h3>
            <p className="text-xs text-slate-400">All products are exposed as structured tools to autonomous AI shopping agents</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Active Coupons:</span>
          {Object.keys(AVAILABLE_COUPONS).slice(0, 3).map((c) => (
            <span key={c} className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#142238] text-[#3395FF] border border-[#0C8CE9]/30 flex items-center gap-1">
              <Tag className="w-3 h-3" /> {c}
            </span>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MERCHANT_CATALOG.map((product) => (
          <div
            key={product.id}
            className="bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition flex flex-col"
          >
            <div className="h-40 w-full relative bg-slate-900 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md text-slate-300 border border-white/10 uppercase">
                {product.category}
              </span>
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

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Price:</span>
                  <span className="text-base font-bold text-white font-mono">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono block">Inventory:</span>
                  <span className={`text-xs font-mono font-semibold ${product.stock < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {product.stock} in stock
                  </span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
