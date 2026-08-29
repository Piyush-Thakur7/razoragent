'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle, ExternalLink, ShieldCheck, QrCode, ArrowUpRight, Copy, Check } from 'lucide-react';
import { RazorpayOrderResponse, CartQuote } from '@/lib/razoragent/types';

interface OrderReceiptCardProps {
  order: RazorpayOrderResponse | null;
  cart: CartQuote | null;
  onVerifyPayment: (orderId: string, paymentId: string) => Promise<void>;
  verificationResult: { verified: boolean; status: string; signature?: string } | null;
}

export default function OrderReceiptCard({
  order,
  cart,
  onVerifyPayment,
  verificationResult,
}: OrderReceiptCardProps) {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!order || !cart) {
    return (
      <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 text-center shadow-xl flex flex-col items-center justify-center space-y-3 min-h-[220px]">
        <CreditCard className="w-8 h-8 text-slate-600" />
        <div>
          <p className="text-slate-300 font-medium text-xs">No Active Order</p>
          <p className="text-slate-500 text-[11px] mt-0.5 max-w-xs">
            Run an autonomous buyer workflow from the terminal to generate a verified Razorpay Test Order.
          </p>
        </div>
      </div>
    );
  }

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    setIsVerifying(true);
    const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
    await onVerifyPayment(order.id, mockPaymentId);
    setIsVerifying(false);
  };

  return (
    <div className="bg-gradient-to-b from-[#0F1629] to-[#0A0D16] border border-[#0C8CE9]/40 rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
      
      {/* Top Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0C8CE9]/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#0C8CE9] flex items-center justify-center shadow-md shadow-[#0C8CE9]/40">
            <span className="font-black text-white text-xs">R</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">Razorpay Test Settlement</h4>
            <p className="text-[10px] text-slate-400 font-mono">Subunit: {order.amount} paise</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 uppercase">
            {verificationResult?.status === 'CAPTURED_AND_SETTLED' ? 'PAID & SETTLED' : order.status}
          </span>
        </div>
      </div>

      {/* Amount & Items */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-slate-400">Total Payable:</span>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              ₹{cart.totalAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-mono text-slate-500 block">
              (Includes 18% GST ₹{cart.tax})
            </span>
          </div>
        </div>

        {/* Item list */}
        <div className="p-2.5 rounded-xl bg-[#080B14] border border-slate-800/80 space-y-1.5 font-mono text-xs">
          {cart.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-slate-300 text-[11px]">
              <span className="truncate max-w-[200px]">{item.quantity}x {item.name}</span>
              <span className="font-semibold text-slate-200">₹{item.subtotal.toLocaleString('en-IN')}</span>
            </div>
          ))}
          {cart.discount > 0 && (
            <div className="flex justify-between text-emerald-400 text-[11px] pt-1 border-t border-slate-800">
              <span>Coupon Discount ({cart.couponApplied})</span>
              <span>-₹{cart.discount.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        {/* Order Details Metadata */}
        <div className="space-y-1 text-[11px] font-mono text-slate-400">
          <div className="flex justify-between items-center">
            <span>Razorpay Order ID:</span>
            <button
              onClick={handleCopyOrderId}
              className="flex items-center space-x-1 text-[#3395FF] hover:underline"
            >
              <span>{order.id}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="flex justify-between">
            <span>Receipt Ref:</span>
            <span className="text-slate-300">{order.receipt}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleSimulatePayment}
          disabled={isVerifying || verificationResult?.status === 'CAPTURED_AND_SETTLED'}
          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#0C8CE9] to-[#2563EB] hover:from-[#0972BD] hover:to-[#1D4ED8] disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-lg shadow-[#0C8CE9]/20 transition"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isVerifying ? 'Verifying HMAC...' : 'Simulate Settlement (HMAC)'}</span>
        </button>

        {order.payment_link && (
          <a
            href={order.payment_link}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-[#141C30] hover:bg-[#1A2642] text-slate-200 text-xs font-medium flex items-center justify-center space-x-1 border border-slate-700 transition"
          >
            <span>Payment Link</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#3395FF]" />
          </a>
        )}
      </div>

      {/* Verification Stamp */}
      {verificationResult && (
        <div className={`p-2.5 rounded-xl text-xs font-mono border ${
          verificationResult.verified
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
            : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          <div className="flex items-center space-x-1.5 font-bold">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>HMAC SHA-256 Webhook Signature Verified</span>
          </div>
          {verificationResult.signature && (
            <p className="text-[10px] text-slate-400 truncate mt-1">
              Sig: {verificationResult.signature}
            </p>
          )}
        </div>
      )}

    </div>
  );
}
