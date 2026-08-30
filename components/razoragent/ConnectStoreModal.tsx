'use client';

import React, { useState, useEffect } from 'react';
import { Store, ShoppingBag, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, X, RefreshCw, Layers } from 'lucide-react';
import { ProductItem } from '@/lib/razoragent/types';

interface ConnectStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreConnected?: (providerName: string, isLive: boolean) => void;
}

export default function ConnectStoreModal({ isOpen, onClose, onStoreConnected }: ConnectStoreModalProps) {
  const [platform, setPlatform] = useState<'shopify' | 'woocommerce' | 'demo'>('shopify');
  const [domain, setDomain] = useState('');
  const [token, setToken] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    isLive?: boolean;
    provider?: string;
    productCount?: number;
    preview?: ProductItem[];
    message?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Check current connection status
      fetch('/api/razoragent/catalog/connect')
        .then((res) => res.json())
        .then((data) => {
          if (data.isLive) {
            setResult({
              success: true,
              isLive: true,
              provider: data.provider,
              productCount: data.productCount,
              message: `Active Live Store: ${data.provider}`,
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/razoragent/catalog/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          domain: domain.trim(),
          token: token.trim(),
          siteUrl: siteUrl.trim(),
          consumerKey: consumerKey.trim(),
          consumerSecret: consumerSecret.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setResult({ error: data.error || 'Failed to connect to store.' });
      } else {
        setResult(data);
        if (onStoreConnected) {
          onStoreConnected(data.provider, data.isLive);
        }
      }
    } catch (err: any) {
      setResult({ error: err.message || 'Network error connecting to store.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/razoragent/catalog/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'demo' }),
      });
      const data = await res.json();
      setResult(data);
      if (onStoreConnected) {
        onStoreConnected(data.provider, false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#0B0F19] border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0E1322] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#0C8CE9]/20 text-[#3395FF]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Merchant Storefront Onboarding</h3>
              <p className="text-xs text-slate-400">Connect your live catalog to RazorAgent's bounded AI buyer gateway</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          
          {/* Step 1: Platform Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2 font-mono uppercase tracking-wider">
              Step 1: Choose Your Platform
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => { setPlatform('shopify'); setResult(null); }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  platform === 'shopify'
                    ? 'bg-[#121E33] border-[#0C8CE9] text-white shadow-lg shadow-[#0C8CE9]/10'
                    : 'bg-[#101524] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#95BF47]"></span>
                  Shopify
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Storefront GraphQL API</div>
              </button>

              <button
                type="button"
                onClick={() => { setPlatform('woocommerce'); setResult(null); }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  platform === 'woocommerce'
                    ? 'bg-[#121E33] border-[#0C8CE9] text-white shadow-lg shadow-[#0C8CE9]/10'
                    : 'bg-[#101524] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#7F54B3]"></span>
                  WooCommerce
                </div>
                <div className="text-[11px] text-slate-400 mt-1">REST API v3</div>
              </button>

              <button
                type="button"
                onClick={() => { setPlatform('demo'); handleUseDemo(); }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  platform === 'demo'
                    ? 'bg-[#121E33] border-[#0C8CE9] text-white shadow-lg shadow-[#0C8CE9]/10'
                    : 'bg-[#101524] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Demo Catalog
                </div>
                <div className="text-[11px] text-slate-400 mt-1">28+ Sample SKUs</div>
              </button>
            </div>
          </div>

          {/* Step 2: Credentials Form */}
          {platform === 'shopify' && (
            <form onSubmit={handleTestConnection} className="space-y-3 bg-[#0E1322] p-4 rounded-2xl border border-slate-800">
              <div className="font-mono text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Step 2: Enter Shopify Storefront Credentials
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Shopify Store Domain</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="your-store.myshopify.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#070A11] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#0C8CE9]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Storefront API Access Token</label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl bg-[#070A11] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#0C8CE9]"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <span>Hint: In Shopify Admin → Settings → Apps → Develop apps → Storefront API.</span>
                  <a
                    href="https://help.shopify.com/en/manual/apps/app-types/custom-apps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#3395FF] hover:underline flex items-center gap-0.5"
                  >
                    Docs <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !domain || !token}
                  className="w-full py-2.5 rounded-xl bg-[#0C8CE9] hover:bg-[#0972BD] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-[#0C8CE9]/20"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Test Connection & Activate Live Catalog</span>
                </button>
              </div>
            </form>
          )}

          {platform === 'woocommerce' && (
            <form onSubmit={handleTestConnection} className="space-y-3 bg-[#0E1322] p-4 rounded-2xl border border-slate-800">
              <div className="font-mono text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Step 2: Enter WooCommerce REST Credentials
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Store URL</label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://your-store.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#070A11] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#0C8CE9]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Consumer Key</label>
                  <input
                    type="password"
                    value={consumerKey}
                    onChange={(e) => setConsumerKey(e.target.value)}
                    placeholder="ck_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl bg-[#070A11] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#0C8CE9]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Consumer Secret</label>
                  <input
                    type="password"
                    value={consumerSecret}
                    onChange={(e) => setConsumerSecret(e.target.value)}
                    placeholder="cs_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl bg-[#070A11] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#0C8CE9]"
                    required
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-400 mt-1">
                Hint: WordPress Admin → WooCommerce → Settings → Advanced → REST API.
              </p>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !siteUrl || !consumerKey || !consumerSecret}
                  className="w-full py-2.5 rounded-xl bg-[#0C8CE9] hover:bg-[#0972BD] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-[#0C8CE9]/20"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Test Connection & Activate Live Catalog</span>
                </button>
              </div>
            </form>
          )}

          {/* Connection Test Results */}
          {result && (
            <div className={`p-4 rounded-2xl border transition ${
              result.error
                ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                : result.isLive
                ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                : 'bg-amber-950/20 border-amber-900/40 text-amber-300'
            }`}>
              <div className="flex items-center gap-2 font-bold text-xs">
                {result.error ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Connection Failed</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{result.isLive ? '🟢 LIVE STORE CONNECTED' : '🟡 DEMO MODE ACTIVE'}</span>
                  </>
                )}
              </div>

              <p className="mt-1 text-[11px] text-slate-300">{result.message || result.error}</p>

              {result.preview && result.preview.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Live Product Preview ({result.productCount} SKUs total):
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {result.preview.map((p) => (
                      <div key={p.id} className="p-2 rounded-xl bg-[#080B14] border border-slate-800 flex items-center space-x-2">
                        <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                        <div className="truncate">
                          <p className="text-white text-[11px] font-medium truncate">{p.name}</p>
                          <p className="text-emerald-400 text-[10px] font-mono">₹{p.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scope Note */}
          <div className="p-3 rounded-xl bg-[#090C15] border border-slate-800 text-[10px] text-slate-400">
            <span className="font-bold text-slate-300">Demo Note:</span> For this showcase, credentials are used for your live session to query your store's public Storefront API and are not stored in any permanent database.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0E1322] border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Active Mode: {result?.isLive ? '🟢 LIVE STORE' : '🟡 DEMO DATA'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
