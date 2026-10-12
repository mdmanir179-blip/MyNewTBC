import React, { useState } from 'react';
import { X, CheckCircle2, IndianRupee, Copy, Check } from 'lucide-react';
import { WmsClaim } from '../types/wms';

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: WmsClaim | null;
  onConfirmPayout: (claimId: string, utrRef: string) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  isOpen,
  onClose,
  claim,
  onConfirmPayout,
  onShowToast
}) => {
  const [utrRef, setUtrRef] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen || !claim) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(claim.refundUpi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
    onShowToast('info', 'UPI Copied', `Copied ${claim.refundUpi} to clipboard.`);
  };

  const handleGenerateSampleUtr = () => {
    const randomUtr = `UTR-${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
    setUtrRef(randomUtr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrRef.trim()) {
      onShowToast('error', 'UTR Missing', 'Please enter or generate a Banking UTR / Transaction Reference number.');
      return;
    }
    onConfirmPayout(claim.id, utrRef.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Disburse UPI Payout
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Claim ID: <span className="font-mono text-slate-800 font-semibold">{claim.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-800 font-medium">Refund Amount to Transfer</span>
              <div className="text-2xl font-bold text-slate-900 font-mono flex items-center gap-1">
                <span>₹{claim.cashbackAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>

          {/* Customer & UPI Detail */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Beneficiary Customer:</span>
              <span className="font-semibold text-slate-900">
                {claim.customerName} ({claim.customerPhone})
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[11px]">Customer Refund UPI ID:</span>
                <span className="font-mono font-bold text-indigo-700 text-sm select-all">
                  {claim.refundUpi}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1 shadow-sm transition-all"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy UPI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* UTR / Transaction Ref */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Bank UTR / Transaction ID *
              </label>
              <button
                type="button"
                onClick={handleGenerateSampleUtr}
                className="text-[11px] text-indigo-700 hover:text-indigo-900 font-medium"
              >
                Auto-generate Sample UTR
              </button>
            </div>
            <input
              type="text"
              required
              value={utrRef}
              onChange={(e) => setUtrRef(e.target.value)}
              placeholder="e.g. UTR-304912984920"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 transition-all"
            />
            <p className="text-[11px] text-slate-500">
              Entering the UTR will mark the claim as Paid and record it into the audit ledger.
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Confirm &amp; Record Paid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
