'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, QrCode, CreditCard, Smartphone, ArrowRight, Lock, Zap } from 'lucide-react';
import { RazorpayOrderResponse, CartQuote } from '@/lib/razoragent/types';

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: RazorpayOrderResponse | null;
  cart: CartQuote | null;
  onPaymentSuccess: (orderId: string, paymentId: string, signature: string) => Promise<void>;
}

export default function RazorpayCheckoutModal({
  isOpen,
  onClose,
  order,
  cart,
  onPaymentSuccess,
}: RazorpayCheckoutModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentId, setPaymentId] = useState<string>('');

  if (!isOpen || !order || !cart) return null;

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    const mockPayId = `pay_${Math.random().toString(36).substring(2, 12)}`;
    setPaymentId(mockPayId);

    // Simulate authentic Razorpay gateway 800ms authorization
    await new Promise((r) => setTimeout(r, 800));

    // Generate mock HMAC signature for test validation
    const mockSig = `sig_${Math.random().toString(36).substring(2, 14)}`;

    await onPaymentSuccess(order.id, mockPayId, mockSig);
    setIsProcessing(false);
    setIsPaid(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0B0F19] border border-[#0C8CE9]/50 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
        
        {/* Razorpay Authentic Blue Header */}
        <div className="bg-gradient-to-r from-[#0C8CE9] to-[#096BB2] p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-[#0C8CE9] font-black text-sm flex items-center justify-center shadow-lg">
              R
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                Razorpay Standard Checkout
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 font-mono font-bold">TEST MODE</span>
              </h3>
              <p className="text-[11px] text-blue-100 font-mono">Order: {order.id}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-baseline">
            <span className="text-xs text-blue-100 font-medium">Amount to Pay:</span>
            <span className="text-2xl font-black font-mono tracking-tight text-white">
              ₹{cart.totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          
          {!isPaid ? (
            <>
              {/* Payment Methods Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedMethod('upi')}
                  className={`p-2.5 rounded-xl border text-center font-mono text-xs transition flex flex-col items-center gap-1 ${
                    selectedMethod === 'upi'
                      ? 'bg-[#121E33] border-[#0C8CE9] text-[#3395FF] font-bold shadow'
                      : 'bg-[#0E1322] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>

                <button
                  onClick={() => setSelectedMethod('card')}
                  className={`p-2.5 rounded-xl border text-center font-mono text-xs transition flex flex-col items-center gap-1 ${
                    selectedMethod === 'card'
                      ? 'bg-[#121E33] border-[#0C8CE9] text-[#3395FF] font-bold shadow'
                      : 'bg-[#0E1322] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cards</span>
                </button>

                <button
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`p-2.5 rounded-xl border text-center font-mono text-xs transition flex flex-col items-center gap-1 ${
                    selectedMethod === 'netbanking'
                      ? 'bg-[#121E33] border-[#0C8CE9] text-[#3395FF] font-bold shadow'
                      : 'bg-[#0E1322] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>NetBanking</span>
                </button>
              </div>

              {/* Dynamic Method Content */}
              {selectedMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-[#080B14] border border-slate-800 text-center space-y-3">
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-inner">
                    <QrCode className="w-28 h-28 text-slate-900" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Scan & Pay via any UPI App</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">GPay · PhonePe · Paytm · CRED</p>
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-[#080B14] border border-slate-800 space-y-2.5 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">Test Card Number</label>
                    <input
                      type="text"
                      disabled
                      value="4111 2222 3333 4444"
                      className="w-full px-3 py-2 bg-[#121624] border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px]">Expiry</label>
                      <input
                        type="text"
                        disabled
                        value="12/28"
                        className="w-full px-3 py-2 bg-[#121624] border border-slate-700 rounded-lg text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px]">CVV</label>
                      <input
                        type="text"
                        disabled
                        value="123"
                        className="w-full px-3 py-2 bg-[#121624] border border-slate-700 rounded-lg text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'netbanking' && (
                <div className="p-4 rounded-2xl bg-[#080B14] border border-slate-800 text-center space-y-2 text-xs">
                  <p className="text-slate-300 font-medium">All Major Indian Banks Supported</p>
                  <p className="text-[11px] text-slate-500 font-mono">HDFC · ICICI · SBI · Axis · Kotak</p>
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0C8CE9] to-[#2563EB] hover:from-[#0972BD] hover:to-[#1D4ED8] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-[#0C8CE9]/30 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isProcessing ? 'Authorizing with Bank...' : `Authorize Payment (₹${cart.totalAmount.toLocaleString('en-IN')})`}</span>
                {!isProcessing && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </>
          ) : (
            /* Payment Success Screen */
            <div className="py-6 text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">Payment Successful</h4>
                <p className="text-xs text-slate-400 mt-1">Transaction captured and verified via HMAC SHA-256</p>
              </div>

              <div className="p-3 rounded-xl bg-[#080B14] border border-slate-800 space-y-1 text-left font-mono text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment ID:</span>
                  <span className="text-emerald-400 font-semibold">{paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="text-[#3395FF]">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="text-white font-bold">₹{cart.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                Return to Dashboard
              </button>
            </div>
          )}

        </div>

        {/* Footer Security Badge */}
        <div className="px-5 py-3 bg-[#080B14] border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#3395FF]" /> 256-Bit SSL Encrypted
          </span>
          <span>PCI-DSS Level 1 Compliant</span>
        </div>

      </div>
    </div>
  );
}
