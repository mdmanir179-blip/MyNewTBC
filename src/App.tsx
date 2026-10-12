/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WmsProduct, WmsClaim, UserSession, ThemeColor } from './types/wms';
import { storage } from './services/storage';
import { cloudSync } from './services/cloudSync';
import { themeService } from './services/theme';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ProofLightbox } from './components/ProofLightbox';
import { LoginModal } from './components/LoginModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPortal } from './components/AdminPortal';
import { CustomerPortal } from './components/CustomerPortal';

export type PortalMode = 'admin' | 'customer';

export default function App() {
  // Portal Entry Point state ('customer' or 'admin')
  const [activePortal, setActivePortal] = useState<PortalMode>(() => {
    // Check URL hash first (e.g. #admin or #customer)
    if (typeof window !== 'undefined' && window.location.hash) {
      if (window.location.hash.toLowerCase().includes('admin')) return 'admin';
      if (window.location.hash.toLowerCase().includes('customer')) return 'customer';
    }
    try {
      const saved = localStorage.getItem('tbc_wms_portal_mode');
      if (saved === 'admin' || saved === 'customer') return saved;
    } catch {}
    return 'customer'; // Default clean customer storefront
  });

  const [language, setLanguage] = useState<'en' | 'bn'>('en');

  // Customer Session details
  const [customerSession, setCustomerSession] = useState<{
    name: string;
    phone: string;
    email: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('tbc_wms_customer_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: '',
      phone: '',
      email: ''
    };
  });

  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tbc_wms_customer_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed && parsed.phone && parsed.name);
      }
    } catch {}
    return false;
  });

  // Admin Authentication Session
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tbc_wms_admin_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed && parsed.name && parsed.type === 'admin');
      }
    } catch {}
    return false;
  });

  const [adminUser, setAdminUser] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem('tbc_wms_admin_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      type: 'admin',
      name: '',
      email: '',
      adminRole: 'Administrator'
    };
  });

  // Color Theme Customization state (default: Indigo with crisp white background)
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(() => themeService.getTheme());
  const themeConfig = themeService.getConfig(currentTheme);

  // Modals
  const [isCustomerLoginModalOpen, setIsCustomerLoginModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Core Data (Zero demo products and claims)
  const [products, setProducts] = useState<WmsProduct[]>([]);
  const [claims, setClaims] = useState<WmsClaim[]>([]);

  // Lightbox
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
    subtitle: ''
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 1. Initial Data Load & 2. Real-Time Cross-Device / Cross-Tab Synchronization
  useEffect(() => {
    // Initial fetch from storage first
    setProducts(storage.getProducts());
    setClaims(storage.getClaims());

    // Fetch authoritative state from server immediately on boot/refresh
    cloudSync.fetchProducts().then((serverProducts) => {
      if (serverProducts && Array.isArray(serverProducts)) {
        storage.saveProducts(serverProducts);
        setProducts(serverProducts);
      }
    });

    // Subscribe to real-time cloud and broadcast sync
    const unsubscribe = cloudSync.subscribe((latestProducts) => {
      setProducts(latestProducts);
    });

    // Check hash on initial load & handle hash changes
    const handleHashRoute = () => {
      if (typeof window === 'undefined') return;
      const isHashAdmin = window.location.hash.toLowerCase().includes('admin');
      const isHashCustomer = window.location.hash.toLowerCase().includes('customer');

      if (isHashAdmin) {
        try {
          const saved = localStorage.getItem('tbc_wms_admin_session');
          const parsed = saved ? JSON.parse(saved) : null;
          if (parsed && parsed.name && parsed.type === 'admin') {
            setIsAdminLoggedIn(true);
            setAdminUser(parsed);
            setActivePortal('admin');
          } else {
            setIsAdminLoginModalOpen(true);
          }
        } catch {
          setIsAdminLoginModalOpen(true);
        }
      } else if (isHashCustomer) {
        setActivePortal('customer');
      }
    };

    handleHashRoute();
    window.addEventListener('hashchange', handleHashRoute);

    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', handleHashRoute);
    };
  }, []);

  // Sync portal mode to localStorage & hash
  const handleSwitchPortal = (mode: PortalMode) => {
    setActivePortal(mode);
    try {
      localStorage.setItem('tbc_wms_portal_mode', mode);
      window.location.hash = mode;
    } catch {}
  };

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectTheme = (theme: ThemeColor) => {
    setCurrentTheme(theme);
    themeService.setTheme(theme);
    addToast(
      'success',
      language === 'bn' ? 'থিম আপডেট হয়েছে' : 'Theme Updated',
      language === 'bn' ? 'নতুন কালার স্কিম সক্রিয় করা হয়েছে।' : 'Accent color updated successfully.'
    );
  };

  // Customer Login / Signup Handlers
  const handleCustomerLoginSuccess = (session: UserSession) => {
    setCustomerSession({
      name: session.name,
      phone: session.phone || '',
      email: session.email || ''
    });
    setIsCustomerLoggedIn(true);
    try {
      localStorage.setItem('tbc_wms_customer_session', JSON.stringify({
        name: session.name,
        phone: session.phone || '',
        email: session.email || ''
      }));
    } catch {}
    setIsCustomerLoginModalOpen(false);
    addToast('success', 'Logged In Successfully', `Welcome, ${session.name}! Ready to claim cashbacks.`);
  };

  const handleCustomerLogout = () => {
    setIsCustomerLoggedIn(false);
    setCustomerSession({
      name: '',
      phone: '',
      email: ''
    });
    try {
      localStorage.removeItem('tbc_wms_customer_session');
    } catch {}
    addToast('info', 'Logged Out', 'Signed out of customer account.');
  };

  // Admin Login Handlers
  const handleAdminLoginSuccess = (session: UserSession) => {
    setAdminUser(session);
    setIsAdminLoggedIn(true);
    try {
      localStorage.setItem('tbc_wms_admin_session', JSON.stringify(session));
    } catch {}
    setIsAdminLoginModalOpen(false);
    setActivePortal('admin');
    window.location.hash = 'admin';
    addToast('success', language === 'bn' ? 'অ্যাডমিন লগইন সফল' : 'Admin Access Granted', `Logged in as ${session.name}.`);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminUser({
      type: 'admin',
      name: '',
      email: '',
      adminRole: 'Administrator'
    });
    try {
      localStorage.removeItem('tbc_wms_admin_session');
    } catch {}
    setActivePortal('customer');
    window.location.hash = 'customer';
    addToast('info', language === 'bn' ? 'অ্যাডমিন লগআউট হয়েছে' : 'Admin Logged Out', 'Switched to Customer storefront.');
  };

  // Product Actions (Real-Time Synchronized across all devices)
  const handleSaveProduct = async (savedProduct: WmsProduct) => {
    const exists = products.some((p) => p.id === savedProduct.id);

    // 1. Optimistic immediate update
    if (exists) {
      storage.updateProduct(savedProduct.id, savedProduct);
    } else {
      storage.addProduct(savedProduct);
    }
    setProducts(storage.getProducts());

    // 2. Sync to server & push to all devices
    const serverProducts = await cloudSync.saveProductToServer(savedProduct);
    if (serverProducts && Array.isArray(serverProducts)) {
      setProducts(serverProducts);
      storage.saveProducts(serverProducts);
    }

    addToast(
      'success',
      exists
        ? (language === 'bn' ? 'প্রোডাক্ট আপডেট হয়েছে' : 'Product Updated')
        : (language === 'bn' ? 'নতুন প্রোডাক্ট যোগ হয়েছে' : 'New Offer Published'),
      exists
        ? (language === 'bn' ? `"${savedProduct.title}" সফলভাবে আপডেট করা হয়েছে।` : `"${savedProduct.title}" updated successfully.`)
        : (language === 'bn' ? `"${savedProduct.title}" সফলভাবে লাইভ করা হয়েছে এবং সমস্ত ডিভাইসে সিঙ্ক হয়েছে।` : `"${savedProduct.title}" published and synchronized across all portals.`)
    );
  };

  // Delete product - instantly removed from customer portal & all devices
  const handleDeleteProduct = async (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const prodTitle = prod ? prod.title : 'Product';

    // 1. Optimistic immediate removal locally
    storage.deleteProduct(productId);
    setProducts(storage.getProducts());

    // 2. Server deletion and broadcast to all devices
    const serverProducts = await cloudSync.deleteProductFromServer(productId);
    if (serverProducts && Array.isArray(serverProducts)) {
      setProducts(serverProducts);
      storage.saveProducts(serverProducts);
    }

    addToast(
      'info',
      language === 'bn' ? 'প্রোডাক্ট মুছে ফেলা হয়েছে' : 'Product Deleted',
      language === 'bn'
        ? `"${prodTitle}" কাস্টমার পোর্টাল এবং সমস্ত ডিভাইস থেকে সাথে সাথে মুছে গেছে।`
        : `"${prodTitle}" immediately deleted across Customer Portal and all connected devices.`
    );
  };

  const handleToggleProductStatus = async (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    const nextStatus = p.status === 'active' ? 'paused' : 'active';

    storage.updateProduct(productId, { status: nextStatus });
    setProducts(storage.getProducts());

    const serverProducts = await cloudSync.updateProductOnServer(productId, { status: nextStatus });
    if (serverProducts && Array.isArray(serverProducts)) {
      setProducts(serverProducts);
      storage.saveProducts(serverProducts);
    }
    addToast('info', 'Status Updated', `${p.title} is now ${nextStatus}.`);
  };

  // Claim Actions
  const handleApproveClaim = (claimId: string) => {
    storage.updateClaim(claimId, { status: 'Approved' });
    setClaims(storage.getClaims());
    addToast(
      'success',
      language === 'bn' ? 'ক্লেইম ভেরিফাই হয়েছে' : 'Claim Proofs Approved',
      language === 'bn' ? 'ইউপিআই পেআউটের জন্য অনুমোদিত হয়েছে।' : 'Claim moved to UPI disbursement queue.'
    );
  };

  const handleRejectClaim = (claimId: string, reason: string) => {
    storage.updateClaim(claimId, {
      status: 'Rejected',
      rejectionReason: reason
    });
    setClaims(storage.getClaims());
    addToast(
      'error',
      language === 'bn' ? 'ক্লেইম বাতিল করা হয়েছে' : 'Claim Rejected',
      `Reason: ${reason}`
    );
  };

  const handleConfirmPayout = (claimId: string, utrRef: string) => {
    storage.recordPayout(claimId, utrRef, adminUser.name);
    setClaims(storage.getClaims());
    addToast(
      'success',
      language === 'bn' ? 'ইউপিআই পেআউট সম্পন্ন' : 'UPI Payout Complete',
      `Banking UTR ${utrRef} recorded successfully.`
    );
  };

  const handleSubmitCustomerClaim = (newClaim: WmsClaim) => {
    storage.addClaim(newClaim);
    setClaims(storage.getClaims());
    // Increment claimed slots
    const prod = products.find((p) => p.id === newClaim.productId);
    if (prod) {
      storage.updateProduct(prod.id, { claimedSlots: prod.claimedSlots + 1 });
      setProducts(storage.getProducts());
    }
    addToast(
      'success',
      language === 'bn' ? 'ক্লেইম সফলভাবে সাবমিট হয়েছে' : 'Claim Submitted Successfully',
      language === 'bn'
        ? 'আপনার ৩টি প্রুফ ভেরিফিকেশনের জন্য পাঠানো হয়েছে।'
        : 'Your screenshots and UPI ID are submitted for admin verification.'
    );
  };

  // Data Reset & Clean Tools
  const handleCleanAllData = () => {
    storage.cleanSlate();
    setProducts([]);
    setClaims([]);
    addToast(
      'info',
      language === 'bn' ? 'ক্লিন স্লেট (ফ্রেশ শুরু)' : 'Clean Slate Ready',
      language === 'bn' ? 'সমস্ত প্রোডাক্ট ও ক্লেইম ডেটা মুছে ফেলা হয়েছে।' : 'All dummy products and claims deleted.'
    );
  };

  const handleResetDemoData = () => {
    storage.resetAllData();
    setProducts(storage.getProducts());
    setClaims(storage.getClaims());
    addToast(
      'info',
      language === 'bn' ? 'ডেমো ডেটা রিসেট' : 'Demo Data Reset',
      language === 'bn' ? 'ফ্রেশ ডেমো প্রোডাক্ট, ক্লেইম ও স্ক্রিনশট লোড হয়েছে।' : 'Loaded fresh demo products, claims, and screenshots.'
    );
  };

  const handleExportCsv = () => {
    const csvContent = storage.exportClaimsAsCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tbc-wms-claims-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'CSV Exported', 'Claims verification and payout ledger downloaded.');
  };

  const handleOpenLightbox = (imageUrl: string, title: string, subtitle?: string) => {
    setLightboxData({
      isOpen: true,
      imageUrl,
      title,
      subtitle
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Proof Lightbox Modal */}
      <ProofLightbox
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={lightboxData.imageUrl}
        title={lightboxData.title}
        subtitle={lightboxData.subtitle}
      />

      {/* Customer Dedicated Login & Sign Up Modal */}
      <LoginModal
        isOpen={isCustomerLoginModalOpen}
        onClose={() => setIsCustomerLoginModalOpen(false)}
        onLoginSuccess={handleCustomerLoginSuccess}
        lang={language}
      />

      {/* Dedicated Admin Login Modal (Accessible only via #admin) */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => {
          setIsAdminLoginModalOpen(false);
          if (!isAdminLoggedIn) {
            setActivePortal('customer');
            window.location.hash = 'customer';
          }
        }}
        onLoginSuccess={handleAdminLoginSuccess}
        lang={language}
      />

      {/* ========================================================================= */}
      {/* PORTAL ROUTER: Completely Separated Customer & Admin Portals              */}
      {/* ========================================================================= */}
      {activePortal === 'admin' && isAdminLoggedIn ? (
        <AdminPortal
          products={products}
          claims={claims}
          currentUser={adminUser}
          currentTheme={currentTheme}
          themeConfig={themeConfig}
          language={language}
          setLanguage={setLanguage}
          onSelectTheme={handleSelectTheme}
          onSwitchToCustomer={() => handleSwitchPortal('customer')}
          onOpenCustomerLogin={() => setIsCustomerLoginModalOpen(true)}
          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
          onLogout={handleAdminLogout}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          onToggleProductStatus={handleToggleProductStatus}
          onApproveClaim={handleApproveClaim}
          onRejectClaim={handleRejectClaim}
          onConfirmPayout={handleConfirmPayout}
          onCleanAllData={handleCleanAllData}
          onResetDemoData={handleResetDemoData}
          onExportCsv={handleExportCsv}
          onShowToast={addToast}
          onOpenLightbox={handleOpenLightbox}
        />
      ) : (
        <CustomerPortal
          products={products}
          claims={claims}
          customerSession={customerSession}
          isLoggedIn={isCustomerLoggedIn}
          language={language}
          setLanguage={setLanguage}
          themeConfig={themeConfig}
          onOpenCustomerLogin={() => setIsCustomerLoginModalOpen(true)}
          onLogout={handleCustomerLogout}
          onSubmitClaim={handleSubmitCustomerClaim}
          onShowToast={addToast}
          onOpenLightbox={handleOpenLightbox}
        />
      )}
    </div>
  );
}
