import React, { useState } from 'react';
import { X, CheckCircle2, IndianRupee } from 'lucide-react';
import { WmsProduct, WmsClaim } from '../types/wms';
import { DEMO_PROOFS } from '../services/storage';

import { compressAndUploadImage } from '../utils/imageCompressor';

interface CustomerClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: WmsProduct | null;
  customer: { name: string; phone: string; email: string };
  onSubmitClaim: (claim: WmsClaim) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
}

export const CustomerClaimModal: React.FC<CustomerClaimModalProps> = ({
  isOpen,
  onClose,
  product,
  customer,
  onSubmitClaim,
  onShowToast
}) => {
  const [specialCode, setSpecialCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [orderProof, setOrderProof] = useState<string>('');
  const [paymentProof, setPaymentProof] = useState<string>('');
  const [ratingProof, setRatingProof] = useState<string>('');
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    fieldKey?: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        onShowToast('error', 'File Too Large', 'Please upload screenshot under 15MB.');
        return;
      }
      if (fieldKey) setUploadingField(fieldKey);
      try {
        const finalUrl = await compressAndUploadImage(file);
        setter(finalUrl);
        onShowToast('success', 'Screenshot Attached', `${file.name} optimized and attached.`);
      } catch (err) {
        onShowToast('error', 'Upload Error', 'Failed to process screenshot file.');
      } finally {
        if (fieldKey) setUploadingField(null);
      }
    }
  };

  const handleQuickFillDemo = () => {
    setSpecialCode(product.specialCode);
    setUpiId(`${customer.name.toLowerCase().replace(/\s+/g, '')}@okaxis`);
    setOrderProof(DEMO_PROOFS.order);
    setPaymentProof(DEMO_PROOFS.payment);
    setRatingProof(DEMO_PROOFS.rating);
    onShowToast('info', 'Demo Proofs Loaded', 'Prefilled valid sample screenshots and matching verification code.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderProof || !paymentProof || !ratingProof) {
      onShowToast(
        'error',
        'Missing Proofs',
        'Please upload all 3 proofs (Order, Payment, and Rating screenshot).'
      );
      return;
    }

    const cleanCode = specialCode.trim().toUpperCase();
    const cleanUpi = upiId.trim();

    if (!cleanUpi.includes('@')) {
      onShowToast('error', 'Invalid UPI ID', 'Please enter a valid UPI address (e.g. mobile@upi).');
      return;
    }

    const isCodeMatched = cleanCode === product.specialCode.trim().toUpperCase();
    const now = new Date().toISOString();

    const newClaim: WmsClaim = {
      id: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
      productId: product.id,
      productTitle: product.title,
      platform: product.platform,
      cashbackAmount: product.cashbackAmount,
      systemCode: product.specialCode,
      submittedCode: cleanCode,
      isCodeMatched,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      refundUpi: cleanUpi,
      orderScreenshot: orderProof,
      paymentScreenshot: paymentProof,
      ratingScreenshot: ratingProof,
      status: 'Pending',
      submittedAt: now,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          action: 'Claim Submitted by Customer',
          note: isCodeMatched
            ? 'Special Code matched system verification.'
            : `Flagged: Submitted code "${cleanCode}" does not match system code "${product.specialCode}".`,
          performedBy: customer.name
        }
      ]
    };

    onSubmitClaim(newClaim);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 max-w-xl w-full rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {product.platform}
              </span>
              <h3 className="text-base font-bold text-slate-900">Submit Cashback Claim</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-sm sm:max-w-md">
              {product.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Cashback Details Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-indigo-700 font-medium">Eligible Cashback Refund</p>
                <p className="text-base font-bold text-slate-900 font-mono">
                  ₹{product.cashbackAmount.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-indigo-600">({product.cashbackType})</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFillDemo}
              className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 shadow-sm transition-all"
            >
              ⚡ Fast Demo Autofill
            </button>
          </div>

          {/* Verification Code Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Special Product Verification Code *
            </label>
            <input
              type="text"
              required
              value={specialCode}
              onChange={(e) => setSpecialCode(e.target.value.toUpperCase())}
              placeholder={`e.g. ${product.specialCode}`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-indigo-700 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 uppercase tracking-widest placeholder:text-slate-400 transition-all"
            />
            <p className="text-[11px] text-slate-500">
              Must match the exact code specified on this campaign card ({product.specialCode}).
            </p>
          </div>

          {/* Proof Uploads Section */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Upload 3 Verification Screenshot Proofs *
            </label>

            {/* 1. Order Confirmation Proof */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-[11px] flex items-center justify-center font-bold text-slate-700">
                    1
                  </span>
                  Order Placed Screenshot
                </span>
                {orderProof && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setOrderProof, 'order')}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white file:text-slate-700 file:shadow-sm file:border file:border-slate-200 hover:file:bg-slate-50 cursor-pointer"
              />
              {orderProof && (
                <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200">
                  <img src={orderProof} alt="Order Preview" className="w-10 h-10 object-cover rounded-lg" />
                  <span className="text-[11px] text-slate-600 truncate">order_proof_file.png</span>
                </div>
              )}
            </div>

            {/* 2. Payment Receipt Proof */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-[11px] flex items-center justify-center font-bold text-slate-700">
                    2
                  </span>
                  Payment Success Screenshot / Invoice
                </span>
                {paymentProof && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setPaymentProof, 'payment')}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white file:text-slate-700 file:shadow-sm file:border file:border-slate-200 hover:file:bg-slate-50 cursor-pointer"
              />
              {paymentProof && (
                <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200">
                  <img src={paymentProof} alt="Payment Preview" className="w-10 h-10 object-cover rounded-lg" />
                  <span className="text-[11px] text-slate-600 truncate">payment_proof_receipt.png</span>
                </div>
              )}
            </div>

            {/* 3. Rating & Review Proof */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-[11px] flex items-center justify-center font-bold text-slate-700">
                    3
                  </span>
                  Delivered 5-Star Rating / Review Screenshot
                </span>
                {ratingProof && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setRatingProof, 'rating')}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white file:text-slate-700 file:shadow-sm file:border file:border-slate-200 hover:file:bg-slate-50 cursor-pointer"
              />
              {ratingProof && (
                <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200">
                  <img src={ratingProof} alt="Rating Preview" className="w-10 h-10 object-cover rounded-lg" />
                  <span className="text-[11px] text-slate-600 truncate">rating_review_screenshot.png</span>
                </div>
              )}
            </div>
          </div>

          {/* Refund UPI ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Disbursement Refund UPI ID *
            </label>
            <input
              type="text"
              required
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. mobile@upi, yourname@okhdfcbank"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-emerald-700 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400 transition-all"
            />
            <p className="text-[11px] text-slate-500">
              Admin will disburse cashback directly to this UPI address upon proof verification.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              Submit Claim for Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
