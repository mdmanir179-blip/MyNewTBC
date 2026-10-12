import React, { useState } from 'react';
import {
  User,
  Lock,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  UserPlus,
  ShoppingBag
} from 'lucide-react';
import { UserSession } from '../types/wms';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (session: UserSession) => void;
  lang: 'en' | 'bn';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  lang
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Customer Form state
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [showCustPassword, setShowCustPassword] = useState(false);

  // Error feedback
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'signup' && !custName.trim()) {
      setErrorMessage(lang === 'bn' ? 'দয়া করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.');
      return;
    }
    if (!custPhone.trim() || custPhone.trim().length < 10) {
      setErrorMessage(
        lang === 'bn'
          ? '১০ ডিজিটের সঠিক মোবাইল নম্বর দিন।'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }
    if (mode === 'signup' && (!custEmail.trim() || !custEmail.includes('@'))) {
      setErrorMessage(
        lang === 'bn'
          ? 'সঠিক ইমেইল এড্রেস প্রদান করুন।'
          : 'Please enter a valid email address.'
      );
      return;
    }
    if (!custPassword.trim() || custPassword.length < 4) {
      setErrorMessage(
        lang === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৪ ডিজিট বা অক্ষরের হতে হবে।'
          : 'Password must be at least 4 characters.'
      );
      return;
    }

    const session: UserSession = {
      type: 'customer',
      name: custName.trim() || 'Rahul Roy',
      phone: custPhone.trim(),
      email: custEmail.trim() || `${custPhone.trim()}@customer.com`
    };

    onLoginSuccess(session);
  };

  const handleDemoCustomer = () => {
    setCustName('Rahul Roy');
    setCustPhone('9876543210');
    setCustEmail('rahul.roy@example.com');
    setCustPassword('customer123');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Banner */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-indigo-600/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {lang === 'bn' ? 'কাস্টমার অ্যাকাউন্ট' : 'Customer Account'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {mode === 'login' ? (lang === 'bn' ? 'লগইন' : 'Sign In') : (lang === 'bn' ? 'সাইন আপ' : 'Sign Up')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {lang === 'bn'
                  ? 'ক্যাশব্যাক ক্লেইম ও ইউপিআই রিফান্ড ট্র্যাকিং'
                  : 'Claim 100% Free cashbacks & track UPI payouts'}
              </p>
            </div>
          </div>

          {/* Toggle between Login and Sign Up */}
          <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-slate-200/60 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'লগইন (Sign In)' : 'Sign In'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'নতুন একাউন্ট (Sign Up)' : 'Sign Up'}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {mode === 'login'
                  ? (lang === 'bn' ? 'আপনার মোবাইল দিয়ে লগইন করুন' : 'Sign in to access your claims')
                  : (lang === 'bn' ? 'নতুন কাস্টমার প্রোফাইল তৈরি করুন' : 'Create your free customer account')}
              </span>
              <button
                type="button"
                onClick={handleDemoCustomer}
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> Auto-Fill Demo
              </button>
            </div>

            {/* Customer Name (Sign Up only) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {lang === 'bn' ? 'আপনার পুরো নাম *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Rahul Roy"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {lang === 'bn' ? 'মোবাইল নম্বর (১০ ডিজিট) *' : 'Mobile Number (10 Digits) *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  title="10 digit phone number"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Email Address (Sign Up only) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {lang === 'bn' ? 'ইমেইল এড্রেস *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {lang === 'bn' ? 'পাসওয়ার্ড *' : 'Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showCustPassword ? 'text' : 'password'}
                  required
                  value={custPassword}
                  onChange={(e) => setCustPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCustPassword(!showCustPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCustPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>
                {mode === 'login'
                  ? (lang === 'bn' ? 'লগইন করুন' : 'Sign In to Account')
                  : (lang === 'bn' ? 'একাউন্ট তৈরি করুন' : 'Create Account')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
