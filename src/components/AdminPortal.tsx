import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  Gift,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  Upload,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  Menu,
  X,
  Globe,
  Eye,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  UserCheck,
  LogOut,
  Sparkles,
  Palette,
  Eraser,
  Trash2,
  ZoomIn,
  Smartphone
} from 'lucide-react';

import {
  WmsProduct,
  WmsClaim,
  ClaimStatus,
  Platform,
  UserSession,
  ThemeColor,
  ThemeConfig
} from '../types/wms';
import { ProductModal } from './ProductModal';
import { PayoutModal } from './PayoutModal';
import { RejectionModal } from './RejectionModal';
import { ClaimDetailDrawer } from './ClaimDetailDrawer';
import { ThemeModal } from './ThemeModal';
import { ConfirmModal } from './ConfirmModal';
import { AppDownloadModal } from './AppDownloadModal';

export type AdminNavSection = 'overview' | 'verification' | 'payouts' | 'products';

export interface AdminPortalProps {
  products: WmsProduct[];
  claims: WmsClaim[];
  currentUser: UserSession;
  currentTheme: ThemeColor;
  themeConfig: ThemeConfig;
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  onSelectTheme: (theme: ThemeColor) => void;
  onSwitchToCustomer: () => void;
  onOpenCustomerLogin: () => void;
  onOpenAdminLogin: () => void;
  onLogout: () => void;
  onSaveProduct: (product: WmsProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleProductStatus: (productId: string) => void;
  onApproveClaim: (claimId: string) => void;
  onRejectClaim: (claimId: string, reason: string) => void;
  onConfirmPayout: (claimId: string, utrRef: string) => void;
  onCleanAllData: () => void;
  onResetDemoData: () => void;
  onExportCsv: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
  onOpenLightbox: (imageUrl: string, title: string, subtitle?: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  products,
  claims,
  currentUser,
  currentTheme,
  themeConfig,
  language,
  setLanguage,
  onSelectTheme,
  onSwitchToCustomer,
  onOpenCustomerLogin,
  onOpenAdminLogin,
  onLogout,
  onSaveProduct,
  onDeleteProduct,
  onToggleProductStatus,
  onApproveClaim,
  onRejectClaim,
  onConfirmPayout,
  onCleanAllData,
  onResetDemoData,
  onExportCsv,
  onShowToast,
  onOpenLightbox
}) => {
  // Navigation
  const [activeSection, setActiveSection] = useState<AdminNavSection>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals & Drawers
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<WmsProduct | null>(null);

  const [selectedClaimForDrawer, setSelectedClaimForDrawer] = useState<WmsClaim | null>(null);
  const [claimToPayout, setClaimToPayout] = useState<WmsClaim | null>(null);
  const [claimToReject, setClaimToReject] = useState<WmsClaim | null>(null);

  // In-app Confirmation Dialog state (Never blocked by iframe sandbox)
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    isDanger: boolean;
    icon: 'trash' | 'eraser' | 'reset' | 'alert';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDanger: false,
    icon: 'alert',
    onConfirm: () => {}
  });

  const handleSaveProductInternal = (product: WmsProduct) => {
    onSaveProduct(product);
    setIsProductModalOpen(false);
    setProductToEdit(null);
    setActiveSection('products'); // Automatically switch to products view so user sees it live!
  };

  const handleRequestDeleteProduct = (prod: WmsProduct) => {
    setConfirmConfig({
      isOpen: true,
      title: language === 'bn' ? 'প্রোডাক্ট মুছে ফেলবেন?' : 'Delete Offer Product?',
      message: language === 'bn'
        ? `"${prod.title}" প্রোডাক্টটি কি সম্পূর্ণ মুছে ফেলতে চান? এটি কাস্টমার পোর্টাল এবং সমস্ত কানেক্টেড ডিভাইস থেকে সাথে সাথে মুছে যাবে।`
        : `Are you sure you want to delete "${prod.title}"? This will immediately remove it from Customer Portal and all connected devices.`,
      confirmText: language === 'bn' ? 'মুছে ফেলুন (Delete)' : 'Delete Product',
      cancelText: language === 'bn' ? 'বাতিল' : 'Cancel',
      isDanger: true,
      icon: 'trash',
      onConfirm: () => onDeleteProduct(prod.id)
    });
  };

  const handleRequestCleanSlate = () => {
    setConfirmConfig({
      isOpen: true,
      title: language === 'bn' ? 'সব মুছে ফ্রেশ শুরু (Clean Slate)?' : 'Clean Slate (Delete All Data)?',
      message: language === 'bn'
        ? '⚠️ সমস্ত প্রোডাক্ট ও ক্লেইম ডেটা সম্পূর্ণ মুছে যাবে। আপনি কি নিশ্চিত যে আপনি একদম ফ্রেশভাবে শুরু করতে চান?'
        : '⚠️ This will permanently remove ALL products, claims, and screenshots for a fresh start. Are you sure?',
      confirmText: language === 'bn' ? 'সব মুছে ফেলুন (Delete All)' : 'Yes, Delete All Data',
      cancelText: language === 'bn' ? 'বাতিল' : 'Cancel',
      isDanger: true,
      icon: 'eraser',
      onConfirm: () => {
        onCleanAllData();
        setActiveSection('products');
      }
    });
  };

  const handleRequestResetDemo = () => {
    setConfirmConfig({
      isOpen: true,
      title: language === 'bn' ? 'ডেমো ডেটা রিলোড করবেন?' : 'Reload Demo Catalog?',
      message: language === 'bn'
        ? 'ডিফল্ট স্যাম্পল ডেমো অফার প্রোডাক্ট, ক্লেইম ও স্ক্রিনশট পুনরায় লোড করতে চান?'
        : 'This will reset and reload default sample demo offers, claims, and verified screenshots.',
      confirmText: language === 'bn' ? 'রিলোড করুন (Reload)' : 'Reload Demo Data',
      cancelText: language === 'bn' ? 'বাতিল' : 'Cancel',
      isDanger: false,
      icon: 'reset',
      onConfirm: () => {
        onResetDemoData();
        setActiveSection('products');
      }
    });
  };

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');

  // Stats calculation
  const stats = useMemo(() => {
    const totalClaims = claims.length;
    const pendingCount = claims.filter((c) => c.status === 'Pending').length;
    const approvedCount = claims.filter((c) => c.status === 'Approved').length;
    const paidCount = claims.filter((c) => c.status === 'Paid').length;
    const rejectedCount = claims.filter((c) => c.status === 'Rejected').length;
    const totalCashbackPaid = claims
      .filter((c) => c.status === 'Paid')
      .reduce((acc, c) => acc + c.cashbackAmount, 0);
    const totalCashbackCommitted = claims
      .filter((c) => c.status === 'Pending' || c.status === 'Approved')
      .reduce((acc, c) => acc + c.cashbackAmount, 0);

    return {
      totalClaims,
      pendingCount,
      approvedCount,
      paidCount,
      rejectedCount,
      totalCashbackPaid,
      totalCashbackCommitted
    };
  }, [claims]);

  // Platform Distribution
  const platformStats = useMemo(() => {
    const map: Record<string, { count: number; totalAmount: number }> = {
      Amazon: { count: 0, totalAmount: 0 },
      Flipkart: { count: 0, totalAmount: 0 },
      Blinkit: { count: 0, totalAmount: 0 },
      Other: { count: 0, totalAmount: 0 }
    };

    claims.forEach((c) => {
      const p = ['Amazon', 'Flipkart', 'Blinkit'].includes(c.platform) ? c.platform : 'Other';
      map[p].count += 1;
      map[p].totalAmount += c.cashbackAmount;
    });

    return map;
  }, [claims]);

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch =
        searchQuery === '' ||
        claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.customerPhone.includes(searchQuery) ||
        claim.refundUpi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.submittedCode.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'CODE_MISMATCH') {
        matchesStatus = !claim.isCodeMatched;
      } else if (statusFilter !== 'ALL') {
        matchesStatus = claim.status === statusFilter;
      }

      const matchesPlatform = platformFilter === 'ALL' || claim.platform === platformFilter;
      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [claims, searchQuery, statusFilter, platformFilter]);

  const navItems = [
    {
      id: 'overview' as AdminNavSection,
      labelEn: 'Campaign Overview',
      labelBn: 'ক্যাম্পেইন ওভারভিউ',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'verification' as AdminNavSection,
      labelEn: 'Proof Verification',
      labelBn: 'প্রুফ ভেরিফিকেশন',
      icon: ShieldCheck,
      badge: stats.pendingCount > 0 ? `${stats.pendingCount}` : null,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'payouts' as AdminNavSection,
      labelEn: 'UPI Disbursements',
      labelBn: 'ইউপিআই পেআউট',
      icon: CreditCard,
      badge: stats.approvedCount > 0 ? `${stats.approvedCount}` : null,
      badgeColor: 'bg-cyan-100 text-cyan-800'
    },
    {
      id: 'products' as AdminNavSection,
      labelEn: 'Product Rewards',
      labelBn: 'প্রোডাক্ট রিওয়ার্ড',
      icon: Gift,
      badge: `${products.length}`
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Dedicated In-App Confirmation Modal (Safe for iframes & mobile) */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        isDanger={confirmConfig.isDanger}
        icon={confirmConfig.icon}
      />

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        onSaveProduct={handleSaveProductInternal}
        onShowToast={onShowToast}
        lang={language}
      />

      {/* Payout Modal */}
      <PayoutModal
        isOpen={!!claimToPayout}
        onClose={() => setClaimToPayout(null)}
        claim={claimToPayout}
        onConfirmPayout={onConfirmPayout}
        onShowToast={onShowToast}
      />

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={!!claimToReject}
        onClose={() => setClaimToReject(null)}
        claim={claimToReject}
        onConfirmReject={onRejectClaim}
      />

      {/* Claim Detail Drawer */}
      <ClaimDetailDrawer
        claim={selectedClaimForDrawer}
        onClose={() => setSelectedClaimForDrawer(null)}
        onOpenLightbox={onOpenLightbox}
        onApprove={onApproveClaim}
        onOpenReject={(claim) => setClaimToReject(claim)}
        onOpenPayout={(claim) => setClaimToPayout(claim)}
      />

      {/* Theme Customization Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={onSelectTheme}
        lang={language}
      />

      {/* Mobile & Desktop App Install Modal */}
      <AppDownloadModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        lang={language}
      />

      {/* ========================================================================= */}
      {/* SIDEBAR NAVIGATION                                                         */}
      {/* ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${themeConfig.gradientFrom} ${themeConfig.gradientTo} flex items-center justify-center text-white font-black text-lg shadow-md ${themeConfig.shadowColor}`}>
                TBC
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  TBC WMS
                  <span className={`text-[10px] font-mono font-bold ${themeConfig.badgeBg} ${themeConfig.primaryText} border ${themeConfig.badgeBorder} px-1.5 py-0.2 rounded`}>
                    Admin
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">Cashback &amp; Rewards Engine</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-800 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-3 flex-1 overflow-y-auto space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {language === 'bn' ? 'প্রধান মেন্যু' : 'Main Modules'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? `${themeConfig.primaryBg} text-white shadow-sm ${themeConfig.shadowColor}`
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Tools Header */}
          <div className="pt-4 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {language === 'bn' ? 'টুলস ও ডেটা' : 'Tools & Data'}
          </div>

          {/* Theme customizer */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-3.5 h-3.5 rounded-full ${themeConfig.primaryBg} ring-2 ring-slate-200`} />
              <span>{language === 'bn' ? 'কালার পরিবর্তন' : 'Change Theme Color'}</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${themeConfig.badgeBg} ${themeConfig.primaryText} border ${themeConfig.badgeBorder}`}>
              {language === 'bn' ? themeConfig.nameBn.split(' ')[0] : themeConfig.nameEn.split(' ')[0]}
            </span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
              <span>{language === 'bn' ? 'CSV লেজার ডাউনলোড' : 'Export Claims CSV'}</span>
            </div>
            <Download className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Clean Slate */}
          <button
            onClick={handleRequestCleanSlate}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Eraser className="w-4 h-4 text-rose-600" />
              <span>{language === 'bn' ? 'সব মুছে ফ্রেশ শুরু' : 'Clean Slate (Start Fresh)'}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
              Clean
            </span>
          </button>

          {/* Reset Demo */}
          <button
            onClick={handleRequestResetDemo}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>{language === 'bn' ? 'ডেমো রিসেট' : 'Reset Demo Data'}</span>
            </div>
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Switch to Customer Portal Button */}
          <button
            onClick={onSwitchToCustomer}
            className="w-full py-2.5 px-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Eye className="w-4 h-4" />
            <span>{language === 'bn' ? 'কাস্টমার পোর্টাল ভিউ' : 'View Customer Portal'}</span>
          </button>

          {/* Mobile & Desktop App Button */}
          <button
            onClick={() => setIsAppModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <span>{language === 'bn' ? 'মোবাইল ও ডেক্সটপ অ্যাপ' : 'Mobile & Desktop App'}</span>
          </button>

          {/* Language Switch */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-100 border border-slate-200 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              Language:
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                  language === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                  language === 'bn' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400">Admin</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT CONTENT                                                      */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-900 p-1.5 rounded-xl border border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black ${themeConfig.primaryText} font-mono tracking-wider`}>
                  TBC WMS
                </span>
                <span className="text-slate-400 hidden sm:inline">•</span>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {activeSection === 'overview' && (language === 'bn' ? 'ক্যাম্পেইন ওভারভিউ' : 'Campaign Overview')}
                  {activeSection === 'verification' && (language === 'bn' ? 'স্ক্রিনশট প্রুফ ভেরিফিকেশন' : 'Proof Verification Queue')}
                  {activeSection === 'payouts' && (language === 'bn' ? 'ইউপিআই পেআউট ও ক্যাশব্যাক' : 'UPI Payout Disbursement')}
                  {activeSection === 'products' && (language === 'bn' ? 'প্রোডাক্ট রিওয়ার্ড অফার' : 'Product Rewards Management')}
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {activeSection === 'overview' && 'Executive metrics, platform distribution, and verification pipeline.'}
                {activeSection === 'verification' && 'Inspect Order, Payment & Rating proofs with Special Code matching.'}
                {activeSection === 'payouts' && 'Disburse cashbacks via UPI ID and record banking transaction UTR references.'}
                {activeSection === 'products' && 'Create and configure merchant products, special verification codes & slots.'}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-white ${themeConfig.primaryClass} ${themeConfig.primaryHoverBg} shadow-xs ${themeConfig.shadowColor} transition-all cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন অফার প্রোডাক্ট' : 'Add Offer Product'}</span>
            </button>

            <button
              onClick={onSwitchToCustomer}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'bn' ? 'কাস্টমার পোর্টাল' : 'Customer View'}</span>
            </button>

            <button
              onClick={() => setIsAppModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors cursor-pointer"
              title="Install Mobile & Desktop App"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'bn' ? 'অ্যাপ' : 'App'}</span>
            </button>
          </div>
        </header>

        {/* Mobile Quick Modules Bar */}
        <div className="md:hidden px-4 py-2.5 flex items-center gap-2 overflow-x-auto bg-white border-b border-slate-200 sticky top-[57px] z-10 scrollbar-none shadow-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? `${themeConfig.primaryBg} text-white shadow-xs`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Section Contents */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ========================================================================= */}
          {/* 1. OVERVIEW DASHBOARD SECTION                                             */}
          {/* ========================================================================= */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Executive KPI Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Claims */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {language === 'bn' ? 'মোট ক্লেইম' : 'Total Claims'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.totalClaims}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <span className="text-emerald-700 font-bold">{stats.paidCount} Paid</span>
                      <span>•</span>
                      <span>{stats.pendingCount} Pending</span>
                    </p>
                  </div>
                </div>

                {/* Pending Verification */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {language === 'bn' ? 'যাচাই অপেক্ষমান' : 'Pending Verification'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-amber-700 font-mono">{stats.pendingCount}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Requires proof screenshot audit
                    </p>
                  </div>
                </div>

                {/* Total Paid Out */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {language === 'bn' ? 'পরিশোধিত ক্যাশব্যাক' : 'Total Disbursed'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-emerald-700 font-mono">
                      ₹{stats.totalCashbackPaid.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      100% Verified UPI Settlements
                    </p>
                  </div>
                </div>

                {/* Committed Pipeline */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {language === 'bn' ? 'পাইপলাইন প্রতিশ্রুতি' : 'Committed Pipeline'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 font-mono">
                      ₹{stats.totalCashbackCommitted.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {stats.approvedCount} approved pending payout
                    </p>
                  </div>
                </div>
              </div>

              {/* Conversion Pipeline & Platform Distribution Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Verification Pipeline Funnel */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      Verification &amp; Payout Conversion Funnel
                    </h3>
                    <span className="text-xs text-slate-500">Live Status</span>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700">1. Proof Submitted (Total Claims)</span>
                        <span className="font-mono text-slate-900">{stats.totalClaims}</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full w-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-amber-700">2. Pending Verification Queue</span>
                        <span className="font-mono text-amber-700">{stats.pendingCount}</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${stats.totalClaims ? (stats.pendingCount / stats.totalClaims) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-cyan-700">3. Proofs Verified &amp; Approved</span>
                        <span className="font-mono text-cyan-700">{stats.approvedCount}</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${stats.totalClaims ? (stats.approvedCount / stats.totalClaims) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-emerald-700">4. UPI Payout Completed</span>
                        <span className="font-mono text-emerald-700">{stats.paidCount}</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${stats.totalClaims ? (stats.paidCount / stats.totalClaims) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Distribution */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-indigo-600" />
                      Platform Share
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(platformStats).map(([plat, pStat]) => (
                      <div
                        key={plat}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{plat}</span>
                          <span className="text-slate-500 block text-[11px]">
                            {pStat.count} claims
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          ₹{pStat.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Verification Submissions */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Recent Proof Submissions
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Latest claims awaiting or processed through the verification pipeline
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSection('verification')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>View All Queue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] font-bold text-slate-500 uppercase bg-slate-50 rounded-xl">
                      <tr>
                        <th className="py-2.5 px-3">Claim ID</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3">Code Check</th>
                        <th className="py-2.5 px-3">Cashback</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {claims.slice(0, 5).map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-indigo-700">{c.id}</td>
                          <td className="py-3 px-3 font-medium text-slate-800">
                            {c.customerName}
                            <span className="block text-[10px] text-slate-400 font-mono">{c.customerPhone}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-700 max-w-[200px] truncate">{c.productTitle}</td>
                          <td className="py-3 px-3 font-mono">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.isCodeMatched
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {c.isCodeMatched ? '✓ Match' : '✕ Mismatch'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            ₹{c.cashbackAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                c.status === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : c.status === 'Approved'
                                  ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                  : c.status === 'Rejected'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              ● {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setSelectedClaimForDrawer(c)}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Campaign Offer Products in Overview */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Gift className="w-4 h-4 text-indigo-600" />
                      {language === 'bn' ? `লাইভ অফার প্রোডাক্টসমূহ (${products.length})` : `Active Offer Products (${products.length})`}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'bn'
                        ? 'সরাসরি এখান থেকেই নতুন প্রোডাক্ট যোগ, এডিট বা ডিলিট করুন'
                        : 'Manage store offers, special verification codes, edit or delete directly'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setProductToEdit(null);
                        setIsProductModalOpen(true);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white ${themeConfig.primaryClass} ${themeConfig.primaryHoverBg} shadow-xs transition-all cursor-pointer`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'নতুন অফার যোগ' : 'Add New Offer'}</span>
                    </button>
                    <button
                      onClick={() => setActiveSection('products')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{language === 'bn' ? 'সব দেখুন' : 'View All'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {products.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="font-semibold text-slate-600 mb-1">
                      {language === 'bn' ? 'কোনো প্রোডাক্ট নেই (ক্লিন স্লেট)' : 'No Products Available (Clean Slate)'}
                    </p>
                    <p className="text-[11px] text-slate-400 mb-3">
                      {language === 'bn' ? 'নতুন ক্যাম্পেইন শুরু করতে অফার প্রোডাক্ট যোগ করুন' : 'Click "Add New Offer" to create a fresh reward campaign.'}
                    </p>
                    <button
                      onClick={() => {
                        setProductToEdit(null);
                        setIsProductModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 cursor-pointer"
                    >
                      + {language === 'bn' ? 'নতুন প্রোডাক্ট যোগ করুন' : 'Add First Product'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {products.slice(0, 4).map((prod) => (
                      <div
                        key={prod.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                              {prod.platform}
                            </span>
                            <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                              {prod.specialCode}
                            </span>
                          </div>
                          <div className="flex gap-2.5 items-center">
                            <img
                              src={prod.imageUrl}
                              alt={prod.title}
                              onClick={() => onOpenLightbox(prod.imageUrl, prod.title, `${prod.brand} • ${prod.platform} • ₹${prod.cashbackAmount}`)}
                              className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0 bg-white cursor-pointer hover:opacity-80 transition-opacity"
                              title="Click to view full image"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                                {prod.title}
                              </h4>
                              <p className="text-[11px] font-mono font-bold text-emerald-700 mt-0.5">
                                ₹{prod.cashbackAmount.toLocaleString('en-IN')} Cashback
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-200/70 pt-2.5">
                          <span className="text-[10px] text-slate-500 font-medium">
                            {prod.claimedSlots}/{prod.totalSlots} slots
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setProductToEdit(prod);
                                setIsProductModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRequestDeleteProduct(prod)}
                              className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. VERIFICATION QUEUE SECTION                                             */}
          {/* ========================================================================= */}
          {activeSection === 'verification' && (
            <div className="space-y-6">
              {/* Filter Controls */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {['ALL', 'Pending', 'Approved', 'Paid', 'Rejected', 'CODE_MISMATCH'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                        statusFilter === st
                          ? `${themeConfig.primaryBg} text-white border-transparent shadow-xs`
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st === 'CODE_MISMATCH' ? '⚠️ Code Mismatches' : st}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID, customer, UPI, code..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Claims Table */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Claims Verification Pipeline ({filteredClaims.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Verify screenshots &amp; matching special codes
                  </span>
                </div>

                {filteredClaims.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No claims match your filter criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-[11px] font-bold text-slate-500 uppercase bg-slate-50 rounded-xl">
                        <tr>
                          <th className="py-3 px-3">Claim ID</th>
                          <th className="py-3 px-3">Customer &amp; UPI</th>
                          <th className="py-3 px-3">Product / Store</th>
                          <th className="py-3 px-3">Special Code Matching</th>
                          <th className="py-3 px-3">Screenshot Proofs (3)</th>
                          <th className="py-3 px-3">Cashback</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Verification Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredClaims.map((claim) => (
                          <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-3 font-mono font-bold text-indigo-700">
                              {claim.id}
                              <span className="block text-[10px] text-slate-400 font-normal">
                                {claim.submittedAt.slice(0, 10)}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 font-medium text-slate-800">
                              {claim.customerName}
                              <span className="block text-[10px] text-slate-400 font-mono">
                                📱 {claim.customerPhone}
                              </span>
                              <span className="block text-[10px] font-mono text-emerald-700 font-semibold">
                                UPI: {claim.refundUpi}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-slate-700 max-w-[200px]">
                              <span className="font-semibold block truncate">{claim.productTitle}</span>
                              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                                {claim.platform}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 font-mono">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-slate-400 block">Req: {claim.systemCode}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold block w-fit ${
                                    claim.isCodeMatched
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {claim.submittedCode} {claim.isCodeMatched ? '✓' : '✕'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() =>
                                    onOpenLightbox(claim.orderScreenshot, '1. Order Screenshot Proof', claim.productTitle)
                                  }
                                  className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-500 shadow-xs"
                                  title="Order Screenshot"
                                >
                                  <img src={claim.orderScreenshot} alt="Order" className="w-full h-full object-cover" />
                                </button>
                                <button
                                  onClick={() =>
                                    onOpenLightbox(claim.paymentScreenshot, '2. Payment Receipt Proof', claim.productTitle)
                                  }
                                  className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-500 shadow-xs"
                                  title="Payment Receipt"
                                >
                                  <img src={claim.paymentScreenshot} alt="Payment" className="w-full h-full object-cover" />
                                </button>
                                <button
                                  onClick={() =>
                                    onOpenLightbox(claim.ratingScreenshot, '3. Rating & Review Proof', claim.productTitle)
                                  }
                                  className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-500 shadow-xs"
                                  title="Rating Review"
                                >
                                  <img src={claim.ratingScreenshot} alt="Rating" className="w-full h-full object-cover" />
                                </button>
                              </div>
                            </td>

                            <td className="py-3.5 px-3 font-mono font-bold text-slate-900 text-sm">
                              ₹{claim.cashbackAmount.toLocaleString('en-IN')}
                            </td>

                            <td className="py-3.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
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
                            </td>

                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {claim.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => onApproveClaim(claim.id)}
                                      className="px-2.5 py-1 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 font-bold transition-colors cursor-pointer"
                                      title="Approve Proofs"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => setClaimToReject(claim)}
                                      className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold transition-colors cursor-pointer"
                                      title="Reject with Reason"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => setSelectedClaimForDrawer(claim)}
                                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
                                >
                                  Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. PAYOUTS DISBURSEMENT SECTION                                           */}
          {/* ========================================================================= */}
          {activeSection === 'payouts' && (
            <div className="space-y-6">
              {/* Payout Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Ready for Payout
                  </span>
                  <h3 className="text-2xl font-black text-cyan-700 font-mono">
                    {claims.filter((c) => c.status === 'Approved').length}
                  </h3>
                  <p className="text-[11px] text-slate-500">Approved claims pending bank disbursement</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Disbursed Payouts
                  </span>
                  <h3 className="text-2xl font-black text-emerald-700 font-mono">
                    ₹{stats.totalCashbackPaid.toLocaleString('en-IN')}
                  </h3>
                  <p className="text-[11px] text-emerald-700 font-medium">Recorded with bank UTRs</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Transactions
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 font-mono">
                    {stats.paidCount} / {stats.totalClaims}
                  </h3>
                  <p className="text-[11px] text-slate-500">100% Audit trail tracked</p>
                </div>
              </div>

              {/* Payout Disbursement Table */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      UPI Disbursement Queue
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Process instant UPI refunds and record banking UTR transaction reference
                    </p>
                  </div>
                  <button
                    onClick={onExportCsv}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Bank File</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] font-bold text-slate-500 uppercase bg-slate-50 rounded-xl">
                      <tr>
                        <th className="py-3 px-3">Claim ID</th>
                        <th className="py-3 px-3">Customer</th>
                        <th className="py-3 px-3">Beneficiary UPI ID</th>
                        <th className="py-3 px-3">Cashback Amount</th>
                        <th className="py-3 px-3">Bank UTR / Ref</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Disbursement Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {claims
                        .filter((c) => c.status === 'Approved' || c.status === 'Paid')
                        .map((claim) => (
                          <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-3 font-mono font-bold text-indigo-700">{claim.id}</td>
                            <td className="py-3.5 px-3 font-medium text-slate-800">
                              {claim.customerName}
                              <span className="block text-[10px] text-slate-400 font-mono">
                                {claim.customerPhone}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-emerald-700">
                              {claim.refundUpi}
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-slate-900 text-sm">
                              ₹{claim.cashbackAmount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-slate-600">
                              {claim.payoutRefNo ? (
                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">
                                  {claim.payoutRefNo}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px] italic">Awaiting UTR</span>
                              )}
                            </td>
                            <td className="py-3.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  claim.status === 'Paid'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                }`}
                              >
                                ● {claim.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              {claim.status === 'Approved' ? (
                                <button
                                  onClick={() => setClaimToPayout(claim)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                                >
                                  ₹ Disburse Payout
                                </button>
                              ) : (
                                <span className="text-emerald-700 font-semibold text-xs flex items-center justify-end gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. PRODUCT REWARDS MANAGEMENT SECTION                                     */}
          {/* ========================================================================= */}
          {activeSection === 'products' && (
            <div className="space-y-6">
              {/* Product Header & Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-indigo-600" />
                    Product Offers &amp; Special Codes ({products.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure store campaigns, mandatory verification codes &amp; slots
                  </p>
                </div>

                <button
                  onClick={() => {
                    setProductToEdit(null);
                    setIsProductModalOpen(true);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white ${themeConfig.primaryClass} ${themeConfig.primaryHoverBg} shadow-xs ${themeConfig.shadowColor} transition-all cursor-pointer`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'bn' ? 'নতুন অফার প্রোডাক্ট যোগ' : 'Add New Offer Product'}</span>
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image - Click to view full image */}
                      <div
                        onClick={() => onOpenLightbox(prod.imageUrl, prod.title, `${prod.brand} • ${prod.platform} • ₹${prod.cashbackAmount} Cashback`)}
                        className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer group"
                        title="Click to view full image in high resolution"
                      >
                        <img
                          src={prod.imageUrl}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <span className="absolute top-3.5 right-3.5 text-xs font-bold px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200 shadow-xs z-10">
                          {prod.platform}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleProductStatus(prod.id);
                          }}
                          className={`absolute top-3.5 left-3.5 text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-xs transition-colors cursor-pointer z-10 ${
                            prod.status === 'active'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          ● {prod.status.toUpperCase()}
                        </button>
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                            <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                            <span>View Full Image</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-3">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          {prod.brand}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                          {prod.title}
                        </h4>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 line-through">
                            ₹{prod.originalPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-emerald-700 font-mono font-bold text-sm">
                            ₹{prod.cashbackAmount.toLocaleString('en-IN')} Cashback ({prod.cashbackType})
                          </span>
                        </div>

                        {/* Special Code Box */}
                        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                          <span className="text-slate-500 block text-[10px]">
                            {language === 'bn' ? 'ভেরিফিকেশন স্পেশাল কোড:' : 'Special Verification Code:'}
                          </span>
                          <span className="font-mono font-bold text-indigo-700 text-xs">
                            {prod.specialCode}
                          </span>
                        </div>

                        {/* Slots */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Slots: {prod.claimedSlots} claimed</span>
                          <span>Total: {prod.totalSlots}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2 pt-3">
                      <a
                        href={prod.purchaseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Store Link</span>
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setProductToEdit(prod);
                            setIsProductModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRequestDeleteProduct(prod)}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
