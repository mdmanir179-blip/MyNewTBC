import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  User,
  CheckCircle2
} from 'lucide-react';
import { UserSession } from '../types/wms';
import { storage } from '../services/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (session: UserSession) => void;
  lang: 'en' | 'bn';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  lang
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Login form state
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Sign up form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState('Executive Admin');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedId = adminId.trim();
    const trimmedPass = adminPass.trim();

    if (!trimmedId || !trimmedPass) {
      setErrorMessage(
        lang === 'bn' ? 'অ্যাডমিন আইডি এবং পাসওয়ার্ড উভয়ই আবশ্যক।' : 'Admin ID and Password are both required.'
      );
      return;
    }

    const session = storage.authenticateAdmin(trimmedId, trimmedPass);
    if (session) {
      onLoginSuccess(session);
    } else {
      setErrorMessage(
        lang === 'bn'
          ? 'ভুল তথ্য! সঠিক অ্যাডমিন আইডি বা পাসওয়ার্ড লিখুন অথবা নতুন একাউন্ট সাইন আপ করুন।'
          : 'Invalid credentials! Please enter valid admin ID & password or create a new account via Sign Up.'
      );
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMessage(
        lang === 'bn' ? 'অনুগ্রহ করে সমস্ত ফিল্ড পূরণ করুন।' : 'Please fill in all required fields.'
      );
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage(
        lang === 'bn' ? 'পাসওয়ার্ড দুটি মেলেনি!' : 'Passwords do not match!'
      );
      return;
    }

    if (signupPassword.length < 4) {
      setErrorMessage(
        lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters long.'
      );
      return;
    }

    const result = storage.registerAdmin({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      role: signupRole
    });

    if (result.success && result.session) {
      setSuccessMessage(
        lang === 'bn' ? 'নতুন অ্যাডমিন একাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Admin registered successfully!'
      );
      setTimeout(() => {
        onLoginSuccess(result.session);
      }, 700);
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-md">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {lang === 'bn' ? 'অ্যাডমিন পোর্টাল এক্সেস' : 'Admin Console Access'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  Secured
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {lang === 'bn'
                  ? 'ক্যাম্পেইন, ক্লেইম ভেরিফিকেশন ও পেআউট নিয়ন্ত্রণ'
                  : 'Manage offers, proof verification, and instant UPI payouts'}
              </p>
            </div>
          </div>

          {/* Toggle Tabs: Login vs Sign Up */}
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-2xl mt-5 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'লগইন (Login)' : 'Admin Login'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'সাইন আপ (Sign Up)' : 'Sign Up Admin'}</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div className="text-xs text-slate-500">
              {lang === 'bn' ? 'অ্যাডমিন ক্রেডেনশিয়াল লিখুন' : 'Enter administrator credentials'}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {lang === 'bn' ? 'অ্যাডমিন আইডি বা ইমেইল *' : 'Admin ID or Email *'}
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {lang === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড *' : 'Admin Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{lang === 'bn' ? 'অ্যাডমিন প্যানেলে লগইন করুন' : 'Login to Admin Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
              >
                {lang === 'bn' ? 'নতুন অ্যাডমিন একাউন্ট খুলতে চান? সাইন আপ করুন →' : 'Need a new admin account? Sign Up here →'}
              </button>
            </div>
          </form>
        ) : (
          /* 2. SIGN UP FORM */
          <form onSubmit={handleSignupSubmit} className="p-6 space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {lang === 'bn' ? 'অ্যাডমিনের পূর্ণ নাম *' : 'Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder={lang === 'bn' ? 'উদাঃ তানভীর আহমেদ' : 'e.g. John Doe / Super Admin'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {lang === 'bn' ? 'ইউজারনেম বা ইমেইল *' : 'Admin Username or Email *'}
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="admin_manir / admin@tbcwms.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {lang === 'bn' ? 'অ্যাডমিন পদবি / ভূমিকা' : 'Admin Designation / Role'}
              </label>
              <select
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
              >
                <option value="Executive Admin">Executive Admin (সম্পূর্ণ নিয়ন্ত্রণ)</option>
                <option value="Campaign Manager">Campaign Manager (অফার ও প্রোডাক্ট)</option>
                <option value="Finance Disburser">Finance Disburser (পেআউট ও ইউটিআর)</option>
                <option value="Audit Verifier">Audit Verifier (প্রুফ স্ক্রিনশট যাচাই)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {lang === 'bn' ? 'পাসওয়ার্ড তৈরি করুন *' : 'Create Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'অ্যাডমিন একাউন্ট রেজিস্টার ও লগইন' : 'Register & Enter Admin Portal'}</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-xs text-slate-600 hover:underline font-semibold cursor-pointer"
              >
                {lang === 'bn' ? 'ইতিমধ্যে একাউন্ট আছে? লগইন করুন →' : 'Already registered? Login here →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
