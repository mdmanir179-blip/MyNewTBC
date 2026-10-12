import React from 'react';
import { X, CheckCircle2, AlertCircle, ZoomIn, ShieldCheck, ShieldAlert, History, IndianRupee, ArrowRight } from 'lucide-react';
import { WmsClaim } from '../types/wms';

interface ClaimDetailDrawerProps {
  claim: WmsClaim | null;
  onClose: () => void;
  onOpenLightbox: (imageUrl: string, title: string, subtitle?: string) => void;
  onApprove: (claimId: string) => void;
  onOpenReject: (claim: WmsClaim) => void;
  onOpenPayout: (claim: WmsClaim) => void;
}

export const ClaimDetailDrawer: React.FC<ClaimDetailDrawerProps> = ({
  claim,
  onClose,
  onOpenLightbox,
  onApprove,
  onOpenReject,
  onOpenPayout
}) => {
  if (!claim) return null;

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                {claim.id}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  claim.status === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : claim.status === 'Approved'
                    ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                    : claim.status === 'Rejected'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                ● {claim.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1 truncate max-w-md">
              {claim.productTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Cashback Due</span>
              <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
                ₹{claim.cashbackAmount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Store Platform</span>
              <p className="text-sm font-semibold text-indigo-700 mt-0.5">{claim.platform}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Submitted Date</span>
              <p className="text-xs font-mono text-slate-700 mt-0.5 truncate">{claim.submittedAt.slice(0, 10)}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Code Match</span>
              <p
                className={`text-xs font-bold mt-0.5 flex items-center gap-1 ${
                  claim.isCodeMatched ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {claim.isCodeMatched ? '✓ Matched' : '✕ Mismatch'}
              </p>
            </div>
          </div>

          {/* Special Verification Code Audit */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              {claim.isCodeMatched ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              )}
              Special Product Verification Code Audit
            </h4>
            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">System Required Code:</span>
                <span className="font-mono font-bold text-slate-900">{claim.systemCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Customer Submitted:</span>
                <span
                  className={`font-mono font-bold ${
                    claim.isCodeMatched ? 'text-emerald-700' : 'text-rose-700 underline'
                  }`}
                >
                  {claim.submittedCode}
                </span>
              </div>
            </div>
          </div>

          {/* Three Uploaded Screenshot Proofs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Uploaded Verification Screenshot Proofs (3)
              </h4>
              <span className="text-[11px] text-indigo-600 font-medium">Click thumbnail to expand</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Proof 1: Order */}
              <div
                onClick={() =>
                  onOpenLightbox(claim.orderScreenshot, 'Order Placed Screenshot Proof', `Customer: ${claim.customerName}`)
                }
                className="group relative cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-500 transition-all shadow-sm"
              >
                <div className="h-36 overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img
                    src={claim.orderScreenshot}
                    alt="Order Proof"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ZoomIn className="w-6 h-6 text-white drop-shadow" />
                  </div>
                </div>
                <div className="p-2.5 bg-white border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-800 truncate">1. Order Screenshot</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">✓ Uploaded &amp; Stored</p>
                </div>
              </div>

              {/* Proof 2: Payment */}
              <div
                onClick={() =>
                  onOpenLightbox(claim.paymentScreenshot, 'Payment Success Screenshot Proof', `UPI ID: ${claim.refundUpi}`)
                }
                className="group relative cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-500 transition-all shadow-sm"
              >
                <div className="h-36 overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img
                    src={claim.paymentScreenshot}
                    alt="Payment Proof"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ZoomIn className="w-6 h-6 text-white drop-shadow" />
                  </div>
                </div>
                <div className="p-2.5 bg-white border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-800 truncate">2. Payment Receipt</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">✓ Uploaded &amp; Stored</p>
                </div>
              </div>

              {/* Proof 3: Rating */}
              <div
                onClick={() =>
                  onOpenLightbox(claim.ratingScreenshot, '5-Star Rating Screenshot Proof', `Store: ${claim.platform}`)
                }
                className="group relative cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-500 transition-all shadow-sm"
              >
                <div className="h-36 overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img
                    src={claim.ratingScreenshot}
                    alt="Rating Proof"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ZoomIn className="w-6 h-6 text-white drop-shadow" />
                  </div>
                </div>
                <div className="p-2.5 bg-white border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-800 truncate">3. Rating &amp; Review</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">✓ Uploaded &amp; Stored</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Payout Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Contact */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Customer Information
              </h5>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-slate-900">{claim.customerName}</p>
                <p className="text-slate-700 font-mono">📱 {claim.customerPhone}</p>
                <p className="text-slate-500">✉️ {claim.customerEmail}</p>
              </div>
            </div>

            {/* Refund UPI & Payout Status */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                UPI Payout Details
              </h5>
              <div className="space-y-1 text-xs">
                <p className="font-mono font-bold text-emerald-700">{claim.refundUpi}</p>
                {claim.payoutRefNo ? (
                  <p className="text-slate-700 text-[11px]">
                    UTR: <span className="font-mono font-semibold text-slate-900">{claim.payoutRefNo}</span>
                  </p>
                ) : (
                  <p className="text-slate-500 text-[11px]">UTR: Pending Disbursement</p>
                )}
                {claim.paidAt && (
                  <p className="text-slate-500 text-[10px]">Disbursed at: {claim.paidAt}</p>
                )}
              </div>
            </div>
          </div>

          {/* Rejection notice if any */}
          {claim.rejectionReason && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Claim Rejection Reason:
              </span>
              <p className="leading-relaxed">{claim.rejectionReason}</p>
            </div>
          )}

          {/* Audit Trail */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-600" />
              Claim Audit Trail &amp; Verification History
            </h5>
            <div className="space-y-2">
              {claim.auditLogs?.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="font-semibold text-indigo-700">{log.action}</span>
                    <span className="font-mono">{log.timestamp}</span>
                  </div>
                  {log.note && <p className="text-slate-700 mt-1 text-[11px]">{log.note}</p>}
                  <p className="text-slate-500 text-[10px] mt-1 font-mono">By: {log.performedBy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/70 flex items-center gap-3">
          {claim.status === 'Pending' && (
            <>
              <button
                onClick={() => onOpenReject(claim)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
              >
                ✕ Reject Claim
              </button>
              <button
                onClick={() => onApprove(claim.id)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                ✓ Approve Proofs
              </button>
              <button
                onClick={() => onOpenPayout(claim)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>₹ Pay Now</span>
              </button>
            </>
          )}

          {claim.status === 'Approved' && (
            <>
              <button
                onClick={() => onOpenReject(claim)}
                className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Revoke to Rejected
              </button>
              <button
                onClick={() => onOpenPayout(claim)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <IndianRupee className="w-4 h-4" />
                <span>Process UPI Disbursement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {claim.status === 'Paid' && (
            <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Payout Complete (UTR: {claim.payoutRefNo})
              </span>
              <button
                onClick={onClose}
                className="text-slate-700 hover:text-slate-900 px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-sm"
              >
                Close
              </button>
            </div>
          )}

          {claim.status === 'Rejected' && (
            <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              <span>Claim is marked as Rejected</span>
              <button
                onClick={() => onApprove(claim.id)}
                className="text-white hover:bg-cyan-700 px-3 py-1.5 rounded-xl bg-cyan-600 transition-colors shadow-sm"
              >
                Re-Approve Claim
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
