import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  User,
  UserPlus,
  LogIn,
  LogOut,
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Phone,
  Mail,
  Tag,
  HelpCircle,
  Clock,
  Home,
  Package,
  ZoomIn,
  Smartphone,
  Download
} from 'lucide-react';
import { WmsProduct, WmsClaim, ThemeConfig } from '../types/wms';
import { CustomerClaimModal } from './CustomerClaimModal';
import { AppDownloadModal } from './AppDownloadModal';

export interface CustomerPortalProps {
  products: WmsProduct[];
  claims: WmsClaim[];
  customerSession: {
    name: string;
    phone: string;
    email: string;
  };
  isLoggedIn: boolean;
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  themeConfig: ThemeConfig;
  onOpenCustomerLogin: () => void;
  onLogout: () => void;
  onSubmitClaim: (claim: WmsClaim) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
  onOpenLightbox: (imageUrl: string, title: string, subtitle?: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  products,
  claims,
  customerSession,
  isLoggedIn,
  language,
  setLanguage,
  themeConfig,
  onOpenCustomerLogin,
  onLogout,
  onSubmitClaim,
  onShowToast,
  onOpenLightbox
}) => {
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerPlatform, setCustomerPlatform] = useState<string>('ALL');
  const [customerTab, setCustomerTab] = useState<'products' | 'my_claims'>('products');
  const [selectedProductForClaim, setSelectedProductForClaim] = useState<WmsProduct | null>(null);
  const [pendingProductAfterLogin, setPendingProductAfterLogin] = useState<WmsProduct | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [isMobileRightDrawerOpen, setIsMobileRightDrawerOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // If user was prompted to login while trying to claim a product, open the claim modal upon login
  useEffect(() => {
    if (isLoggedIn && pendingProductAfterLogin) {
      setSelectedProductForClaim(pendingProductAfterLogin);
      setPendingProductAfterLogin(null);
    }
  }, [isLoggedIn, pendingProductAfterLogin]);

  // Filtered Products for Customer
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const isActive = prod.status !== 'paused';
      const matchesSearch =
        customerSearch === '' ||
        prod.title.toLowerCase().includes(customerSearch.toLowerCase()) ||
        prod.brand.toLowerCase().includes(customerSearch.toLowerCase()) ||
        prod.specialCode.toLowerCase().includes(customerSearch.toLowerCase());
      const matchesPlatform = customerPlatform === 'ALL' || prod.platform === customerPlatform;
      return isActive && matchesSearch && matchesPlatform;
    });
  }, [products, customerSearch, customerPlatform]);

  // Customer Claims for current phone session
  const customerClaims = useMemo(() => {
    if (!customerSession.phone) return [];
    return claims.filter((c) => c.customerPhone === customerSession.phone);
  }, [claims, customerSession.phone]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    onShowToast('info', 'Code Copied', `Copied special code ${code} to clipboard.`);
  };

  // Click handler for "Submit 3 Proofs"
  const handleClaimButtonClick = (prod: WmsProduct) => {
    if (!isLoggedIn || !customerSession.phone) {
      setPendingProductAfterLogin(prod);
      onShowToast(
        'info',
        language === 'bn' ? 'লগইন প্রয়োজন' : 'Login Required',
        language === 'bn'
          ? 'রিফান্ড ক্লেইম করার জন্য অনুগ্রহ করে প্রথমে লগইন বা সাইন আপ করুন।'
          : 'Please login or sign up before submitting your refund claim.'
      );
      onOpenCustomerLogin();
      return;
    }
    setSelectedProductForClaim(prod);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-20 sm:pb-0">
      {/* Customer Claim Modal */}
      <CustomerClaimModal
        isOpen={!!selectedProductForClaim}
        onClose={() => setSelectedProductForClaim(null)}
        product={selectedProductForClaim}
        customer={customerSession}
        onSubmitClaim={(claim) => {
          onSubmitClaim(claim);
          setCustomerTab('my_claims');
        }}
        onShowToast={onShowToast}
      />

      {/* Mobile & Desktop App Modal */}
      <AppDownloadModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        lang={language}
      />

      {/* ========================================================================= */}
      {/* TOP NAVBAR                                                                */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo & Portal Name */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${themeConfig.gradientFrom} ${themeConfig.gradientTo} flex items-center justify-center text-white font-black text-lg shadow-md ${themeConfig.shadowColor}`}>
              TBC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight">TBC WMS</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {language === 'bn' ? 'কাস্টমার পোর্টাল' : 'Deals & Cashback'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {language === 'bn' ? '১০০% ফ্রি ক্যাশব্যাক ও রিভিউ অফার' : '100% Free Cashback & Review Deals'}
              </p>
            </div>
          </div>

          {/* Desktop User Session & Actions */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            {/* Language Switch */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  language === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  language === 'bn' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* Install Mobile & Desktop App */}
            <button
              onClick={() => setIsAppModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
              title={language === 'bn' ? 'মোবাইল ও ডেক্সটপ অ্যাপ ইনস্টল করুন' : 'Install Mobile & Desktop App'}
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'bn' ? 'অ্যাপ ডাউনলোড' : 'Install App'}</span>
            </button>

            {/* Customer Account / Profile badge with Dropdown */}
            {isLoggedIn && customerSession.name ? (
              <div className="relative">
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs transition-colors cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-slate-800 max-w-[120px] truncate">{customerSession.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showAccountDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{customerSession.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{customerSession.phone}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowAccountDropdown(false);
                        setCustomerTab('my_claims');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'bn' ? 'আমার ক্লেইমসমূহ' : 'My Claims'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowAccountDropdown(false);
                        onOpenCustomerLogin();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{language === 'bn' ? 'একাউন্ট পরিবর্তন' : 'Switch Account'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowAccountDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Dedicated LOGIN / SIGN UP Button */
              <button
                onClick={onOpenCustomerLogin}
                className={`text-xs font-bold px-3.5 py-2 rounded-2xl text-white ${themeConfig.primaryClass} ${themeConfig.primaryHoverBg} shadow-sm ${themeConfig.shadowColor} transition-all flex items-center gap-1.5 cursor-pointer`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'লগইন / সাইন আপ' : 'Login / Sign Up'}</span>
              </button>
            )}
          </div>

          {/* Mobile Right-Side Hamburger Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            {!isLoggedIn ? (
              <button
                onClick={onOpenCustomerLogin}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-xl text-white ${themeConfig.primaryClass} shadow-xs flex items-center gap-1 cursor-pointer`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'লগইন' : 'Login'}</span>
              </button>
            ) : (
              <button
                onClick={() => setCustomerTab('my_claims')}
                className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="max-w-[70px] truncate">{customerSession.name.split(' ')[0]}</span>
              </button>
            )}

            {/* Right-Side Menubar Toggle */}
            <button
              onClick={() => setIsMobileRightDrawerOpen(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Open Menu"
              aria-label="Open Right Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE RIGHT-SIDE MENUBAR DRAWER                                          */}
      {/* ========================================================================= */}
      {isMobileRightDrawerOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileRightDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Slide-out Drawer Panel (Right Side) */}
          <div className="fixed inset-y-0 right-0 max-w-[280px] w-full bg-white shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-right duration-200 border-l border-slate-200">
            {/* Drawer Header */}
            <div>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${themeConfig.gradientFrom} ${themeConfig.gradientTo} flex items-center justify-center text-white font-black text-sm shadow-xs`}>
                    TBC
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {language === 'bn' ? 'মেন্যু' : 'Menu'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileRightDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Account Section */}
              <div className="p-4 border-b border-slate-100">
                {isLoggedIn && customerSession.name ? (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {customerSession.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{customerSession.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{customerSession.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1 border-t border-slate-200/60">
                      <button
                        onClick={() => {
                          setIsMobileRightDrawerOpen(false);
                          setCustomerTab('my_claims');
                        }}
                        className="flex-1 py-1.5 text-center text-[11px] font-bold text-indigo-700 bg-white border border-slate-200 rounded-xl shadow-2xs cursor-pointer"
                      >
                        {language === 'bn' ? 'আমার ক্লেইম' : 'My Claims'}
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileRightDrawerOpen(false);
                          onLogout();
                        }}
                        className="px-2.5 py-1.5 text-[11px] font-bold text-rose-600 bg-white border border-slate-200 rounded-xl shadow-2xs cursor-pointer"
                      >
                        {language === 'bn' ? 'লগআউট' : 'Logout'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileRightDrawerOpen(false);
                      onOpenCustomerLogin();
                    }}
                    className={`w-full py-2.5 rounded-2xl text-xs font-bold text-white ${themeConfig.primaryClass} shadow-sm flex items-center justify-center gap-2 cursor-pointer`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{language === 'bn' ? 'লগইন বা সাইন আপ করুন' : 'Login / Sign Up'}</span>
                  </button>
                )}
              </div>

              {/* Navigation Links & Categories */}
              <div className="p-4 space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'bn' ? 'ক্যাটাগরি ও ফিল্টার' : 'Store Platforms'}
                </div>

                <div className="space-y-1">
                  {['ALL', 'Amazon', 'Flipkart', 'Blinkit', 'Meesho', 'Myntra'].map((plat) => (
                    <button
                      key={plat}
                      onClick={() => {
                        setCustomerPlatform(plat);
                        setCustomerTab('products');
                        setIsMobileRightDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        customerPlatform === plat && customerTab === 'products'
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{plat === 'ALL' ? (language === 'bn' ? 'সকল অফার' : 'All Deals') : plat}</span>
                      {customerPlatform === plat && customerTab === 'products' && (
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>

                {customerClaims.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setCustomerTab('my_claims');
                        setIsMobileRightDrawerOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'bn' ? 'আমার ক্লেইম ট্র্যাকিং' : 'Track My Claims'}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px]">
                        {customerClaims.length}
                      </span>
                    </button>
                  </div>
                )}

                {/* Mobile & Desktop App Install */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsMobileRightDrawerOpen(false);
                      setIsAppModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{language === 'bn' ? 'মোবাইল ও ডেক্সটপ অ্যাপ' : 'Mobile & Desktop App'}</span>
                    </span>
                    <Download className="w-3.5 h-3.5 text-indigo-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer: Language & Info */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
              {/* Language Switch */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs">
                <span className="text-[11px] font-semibold text-slate-500">
                  {language === 'bn' ? 'ভাষা:' : 'Language:'}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                      language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('bn')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                      language === 'bn' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                TBC WMS 100% Free Cashback Deals
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT CONTENT                                                      */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Customer Controls: Platform Filters & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
          {/* Platform Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['ALL', 'Amazon', 'Flipkart', 'Blinkit', 'Meesho', 'Myntra'].map((plat) => (
              <button
                key={plat}
                onClick={() => {
                  setCustomerPlatform(plat);
                  setCustomerTab('products');
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  customerPlatform === plat && customerTab === 'products'
                    ? `${themeConfig.primaryBg} text-white border-transparent shadow-sm ${themeConfig.shadowColor}`
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {plat === 'ALL' ? (language === 'bn' ? 'সকল অফার' : 'All Deals') : plat}
              </button>
            ))}
          </div>

          {/* Search Input & Claims tracking toggle */}
          <div className="flex items-center gap-2.5">
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setCustomerTab('products');
                }}
                placeholder={language === 'bn' ? 'পণ্য খুঁজুন...' : 'Search deals & products...'}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {customerClaims.length > 0 && (
              <button
                onClick={() => setCustomerTab(customerTab === 'products' ? 'my_claims' : 'products')}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  customerTab === 'my_claims'
                    ? `${themeConfig.primaryBg} text-white shadow-sm`
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {customerTab === 'my_claims'
                    ? (language === 'bn' ? 'অফার দেখুন' : 'View Deals')
                    : (language === 'bn' ? `আমার ক্লেইম (${customerClaims.length})` : `My Claims (${customerClaims.length})`)}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: MY CLAIMS STATUS TRACKER                                           */}
        {/* ========================================================================= */}
        {customerTab === 'my_claims' && customerClaims.length > 0 ? (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  {language === 'bn' ? 'আমার সাবমিটকৃত রিফান্ড ক্লেইম ও ট্র্যাকিং' : 'My Submitted Claims & Refund Tracking'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track verification status, admin approvals, and UPI payment UTR references.
                </p>
              </div>
              <button
                onClick={() => setCustomerTab('products')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                {language === 'bn' ? '← অফার পণ্যসমূহে ফিরে যান' : '← Back to Deals Catalog'}
              </button>
            </div>

            <div className="space-y-3">
              {customerClaims.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                        {c.id}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
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
                      <span className="text-xs text-slate-400 font-mono">• {c.platform}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{c.productTitle}</h4>

                    <p className="text-xs text-slate-600 font-mono">
                      Refund UPI: <span className="text-emerald-700 font-bold">{c.refundUpi}</span>
                    </p>

                    {c.payoutRefNo && (
                      <p className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg inline-block">
                        Bank Transaction UTR: {c.payoutRefNo}
                      </p>
                    )}

                    {c.rejectionReason && (
                      <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                        Reason: {c.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenLightbox(c.orderScreenshot, 'Order Proof', c.productTitle)}
                        className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-xs cursor-pointer"
                      >
                        Order Proof
                      </button>
                      <button
                        onClick={() => onOpenLightbox(c.paymentScreenshot, 'Payment Proof', c.productTitle)}
                        className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-xs cursor-pointer"
                      >
                        Payment Proof
                      </button>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block">Cashback</span>
                      <span className="text-xl font-mono font-bold text-emerald-700">
                        ₹{c.cashbackAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* TAB 2: PUBLIC DEALS & PRODUCTS CATALOG                                     */
          /* ========================================================================= */
          <div className="space-y-4">
            {filteredProducts.length === 0 && (
              <div className="p-16 text-center rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <div className="text-4xl">🛍️</div>
                <h3 className="text-lg font-bold text-slate-900">
                  {language === 'bn' ? 'কোনো সক্রিয় অফার পাওয়া যায়নি' : 'No Active Cashback Deals'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {products.length === 0
                    ? (language === 'bn' ? 'নতুন ক্যাম্পেইন অফার শীঘ্রই যোগ করা হবে।' : 'New cashback reward campaigns will be added shortly. Please check back soon!')
                    : (language === 'bn' ? 'আপনার অনুসন্ধানের সাথে কোনো পণ্য মেলেনি।' : 'No products matched your search or platform filter.')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => {
                const isAlreadyClaimed = customerSession.phone
                  ? claims.some((c) => c.customerPhone === customerSession.phone && c.productId === prod.id)
                  : false;
                const existingClaim = customerSession.phone
                  ? claims.find((c) => c.customerPhone === customerSession.phone && c.productId === prod.id)
                  : undefined;

                return (
                  <div
                    key={prod.id}
                    className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product Image - Click to view full image */}
                      <div
                        onClick={() => onOpenLightbox(prod.imageUrl, prod.title, `${prod.brand} • ${prod.platform} • ₹${prod.cashbackAmount} Cashback`)}
                        className="relative h-52 bg-slate-100 overflow-hidden cursor-pointer group"
                        title={language === 'bn' ? 'ছবি বড় করে দেখতে ক্লিক করুন' : 'Click to view full image in high resolution'}
                      >
                        <img
                          src={prod.imageUrl}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <span className="absolute top-3.5 right-3.5 text-xs font-bold px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200 shadow-xs z-10">
                          {prod.platform}
                        </span>
                        <span className="absolute bottom-3.5 left-3.5 text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white shadow-xs z-10">
                          {prod.cashbackType}
                        </span>

                        {/* Hover Overlay with Zoom Prompt */}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                          <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-xl border border-white/20">
                            <ZoomIn className="w-4 h-4 text-emerald-400" />
                            <span>{language === 'bn' ? 'বড় করে ছবি দেখুন' : 'View Full Image'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-3">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          {prod.brand}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                          {prod.title}
                        </h4>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <div>
                            <span className="text-slate-400 line-through block text-[11px]">
                              ₹{prod.originalPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-emerald-700 font-mono font-bold text-base">
                              ₹{prod.cashbackAmount.toLocaleString('en-IN')} Cashback
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-500 font-medium">
                            {prod.totalSlots - prod.claimedSlots} slots left
                          </span>
                        </div>

                        {/* Special Verification Code Box */}
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="text-slate-500 block text-[10px] font-medium">
                              {language === 'bn' ? 'প্রয়োজনীয় স্পেশাল কোড:' : 'Mandatory Special Code:'}
                            </span>
                            <span className="font-mono font-bold text-indigo-700 text-xs tracking-wider">
                              {prod.specialCode}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(prod.specialCode)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                            title="Copy Special Code"
                          >
                            {copiedCode === prod.specialCode ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-5 pt-0 space-y-2">
                      <a
                        href={prod.purchaseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <span>🛒 Buy on {prod.platform}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {isAlreadyClaimed ? (
                        <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-center text-xs flex items-center justify-center gap-2">
                          <span className="text-slate-600">Claim Status:</span>
                          <span
                            className={`font-bold ${
                              existingClaim?.status === 'Paid'
                                ? 'text-emerald-700'
                                : existingClaim?.status === 'Approved'
                                ? 'text-cyan-700'
                                : existingClaim?.status === 'Rejected'
                                ? 'text-rose-700'
                                : 'text-amber-700'
                            }`}
                          >
                            ● {existingClaim?.status}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaimButtonClick(prod)}
                          className={`w-full py-2.5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${themeConfig.primaryClass} ${themeConfig.primaryHoverBg} ${themeConfig.shadowColor} cursor-pointer`}
                        >
                          <span>📋 {language === 'bn' ? '৩টি প্রুফ দিয়ে রিফান্ড ক্লেইম করুন' : 'Submit 3 Proofs for Refund'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR                                              */}
      {/* (User request: mobile app menu theke niche theke login, menu, ke replace koro Offer, Order) */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 shadow-lg flex items-center justify-around sm:hidden">
        {/* Tab 1: Home (হোম) */}
        <button
          onClick={() => {
            setCustomerTab('products');
            setCustomerSearch('');
            setCustomerPlatform('ALL');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            customerTab === 'products' && customerSearch === '' && customerPlatform === 'ALL'
              ? `${themeConfig.primaryText} font-bold bg-slate-50`
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">{language === 'bn' ? 'হোম' : 'Home'}</span>
        </button>

        {/* Tab 2: Offer (অফার) - Deals & Cashbacks */}
        <button
          onClick={() => {
            setCustomerTab('products');
            window.scrollTo({ top: 280, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            customerTab === 'products'
              ? `${themeConfig.primaryText} font-bold bg-slate-50`
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">{language === 'bn' ? 'অফার' : 'Offer'}</span>
        </button>

        {/* Tab 3: Search (খুঁজুন) */}
        <button
          onClick={() => {
            setCustomerTab('products');
            if (searchInputRef.current) {
              searchInputRef.current.focus();
            }
            window.scrollTo({ top: 220, behavior: 'smooth' });
          }}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">{language === 'bn' ? 'খুঁজুন' : 'Search'}</span>
        </button>

        {/* Tab 4: Order (অর্ডার) - Replaces Login & Menu */}
        <button
          onClick={() => {
            if (!isLoggedIn) {
              onShowToast(
                'info',
                language === 'bn' ? 'লগইন প্রয়োজন' : 'Login Required',
                language === 'bn'
                  ? 'আপনার অর্ডার ও ক্লেইম দেখতে অনুগ্রহ করে লগইন করুন।'
                  : 'Please login or sign up to view your orders and claims.'
              );
              onOpenCustomerLogin();
              return;
            }
            setCustomerTab('my_claims');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 relative flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            customerTab === 'my_claims'
              ? `${themeConfig.primaryText} font-bold bg-slate-50`
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Package className="w-5 h-5" />
            {customerClaims.length > 0 && (
              <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
                {customerClaims.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium leading-none">{language === 'bn' ? 'অর্ডার' : 'Order'}</span>
        </button>

        {/* Tab 5: Mobile & Desktop App */}
        <button
          onClick={() => setIsAppModalOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
        >
          <Smartphone className="w-5 h-5 text-indigo-600" />
          <span className="text-[10px] font-medium leading-none">{language === 'bn' ? 'অ্যাপ' : 'App'}</span>
        </button>
      </nav>

      {/* Customer Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-xs text-slate-500 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} TBC WMS. All rights reserved. 100% Verified UPI Cashbacks.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>✓ Verified Purchases</span>
            <span>•</span>
            <span>⚡ Instant UPI Refunds</span>
            <span>•</span>
            <button
              onClick={() => setIsAppModalOpen(true)}
              className="text-slate-500 hover:text-indigo-600 transition-colors font-medium flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              title={language === 'bn' ? 'মোবাইল ও ডেক্সটপ অ্যাপ ইনস্টল করুন' : 'Install Mobile & Desktop App'}
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'bn' ? 'মোবাইল ও ডেক্সটপ অ্যাপ' : 'Mobile & Desktop App'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
