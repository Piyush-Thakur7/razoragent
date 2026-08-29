'use client';

import React, { useState } from 'react';
import { Package, Tag, Star, Plus, Search, Edit2, Check, Sparkles, ArrowRight, X, Image as ImageIcon } from 'lucide-react';
import { MERCHANT_CATALOG, AVAILABLE_COUPONS } from '@/lib/razoragent/catalog-data';
import { ProductItem, ProductCategory } from '@/lib/razoragent/types';

interface MerchantCatalogViewProps {
  onSelectProductToTest?: (productName: string) => void;
}

export default function MerchantCatalogView({ onSelectProductToTest }: MerchantCatalogViewProps) {
  const [catalog, setCatalog] = useState<ProductItem[]>(MERCHANT_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Product Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<string>('electronics');
  const [newPrice, setNewPrice] = useState(2499);
  const [newStock, setNewStock] = useState(20);
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80');

  const filteredCatalog = catalog.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newProduct: ProductItem = {
      id: `prod_custom_${Date.now()}`,
      name: newName.trim(),
      category: newCategory.trim().toLowerCase() as ProductCategory,
      price: Number(newPrice),
      stock: Number(newStock),
      rating: 4.9,
      reviewCount: 1,
      image: newImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      description: `Custom merchant product added live to MCP inventory.`,
      specs: { 'Custom Item': 'Live Added' },
      tags: [newCategory.toLowerCase(), 'custom'],
      eligibleCoupons: ['AGENT500', 'BUILD2026'],
    };

    setCatalog((prev) => [newProduct, ...prev]);
    setIsAddModalOpen(false);
    setNewName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Search & Actions Strip */}
      <div className="p-4 rounded-2xl bg-[#0E1322] border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog by name or category (e.g. keyboard, coffee)..."
            className="w-full pl-9 pr-3 py-2 bg-[#080B14] border border-slate-800 rounded-xl text-slate-200 text-xs font-sans focus:border-[#0C8CE9] focus:outline-none"
          />
        </div>

        {/* Coupons & Add Button */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            <span className="text-[11px] text-slate-400 font-mono">Coupons:</span>
            {Object.keys(AVAILABLE_COUPONS).slice(0, 2).map((c) => (
              <span key={c} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#142238] text-[#3395FF] border border-[#0C8CE9]/30">
                {c}
              </span>
            ))}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#0C8CE9] hover:bg-[#0972BD] text-white text-xs font-bold font-sans flex items-center space-x-1.5 transition shadow-lg shadow-[#0C8CE9]/25"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Product</span>
          </button>
        </div>

      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCatalog.map((product) => {
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

                {/* Price & Stock Controls with manual input */}
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

      {/* Add Custom Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B0F19] border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#3395FF]" /> Add Custom Product to MCP Catalog
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 font-sans text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ergonomic Office Chair"
                  className="w-full px-3 py-2 bg-[#080B14] border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. furniture"
                    className="w-full px-3 py-2 bg-[#080B14] border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Price in INR (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#080B14] border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Initial Stock Count</label>
                <input
                  type="number"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#080B14] border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080B14] border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0C8CE9] hover:bg-[#0972BD] text-white text-xs font-bold"
                >
                  Save & Index to MCP
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
