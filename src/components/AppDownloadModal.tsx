import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Download,
  Share2,
  CheckCircle2,
  X,
  ExternalLink,
  Copy,
  Check,
  Zap,
  WifiOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronRight
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'bn';
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isDesktop, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop'>(() => {
    if (isDesktop) return 'desktop';
    return 'mobile';
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tbcwms.com';

  const handleInstallClick = async () => {
    setInstallStatus(null);
    const result = await install();
    if (result === 'accepted') {
      setInstallStatus(
        lang === 'bn'
          ? 'অ্যাপটি সফলভাবে আপনার ডিভাইসে ইনস্টল করা হয়েছে!'
          : 'App installed successfully on your device!'
      );
    } else if (result === 'manual') {
      // If browser doesn't expose beforeinstallprompt (e.g. iOS or manual install needed)
      setInstallStatus(
        lang === 'bn'
          ? 'ব্রাউজারের মেন্যু থেকে "Add to Home screen" অথবা "Install App" সিলেক্ট করুন।'
          : 'Please select "Install App" or "Add to Home screen" from your browser menu.'
      );
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 max-w-xl w-full rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="relative p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  {lang === 'bn' ? 'মোবাইল ও ডেক্সটপ অ্যাপ' : 'Mobile & Desktop App'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  PWA Fast App
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {lang === 'bn'
                  ? 'আপনার মোবাইল (Android/iOS) ও কম্পিউটারে ইনস্টল করে দ্রুত ব্যবহার করুন'
                  : 'Install TBC WMS directly on Android, iPhone, Windows, Mac & Linux'}
              </p>
            </div>
          </div>

          {/* Quick 1-Click Install CTA if browser supports prompt */}
          <div className="mt-5 p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {isInstalled
                    ? lang === 'bn'
                      ? 'অ্যাপ ইতিমধ্যে ইনস্টল করা আছে'
                      : 'App is already installed!'
                    : lang === 'bn'
                    ? '১-ক্লিকে ইনস্টল করুন'
                    : '1-Click Fast App Install'}
                </p>
                <p className="text-[11px] text-slate-300">
                  {lang === 'bn'
                    ? 'কোনো ভারী ডাউনলোড বা স্টোরেজ ঝামেলা নেই (০ MB)'
                    : 'Instant standalone launch, 0 MB storage, offline ready'}
                </p>
              </div>
            </div>

            {!isInstalled ? (
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-md shadow-indigo-600/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'এখনই ইনস্টল করুন' : 'Install App Now'}</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ইনস্টল হয়েছে' : 'Installed'}</span>
              </span>
            )}
          </div>

          {installStatus && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{installStatus}</span>
            </div>
          )}

          {/* Toggle Tabs: Mobile vs Desktop */}
          <div className="flex items-center p-1 bg-white/10 rounded-2xl mt-4 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('mobile')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'mobile'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{lang === 'bn' ? '📱 মোবাইল অ্যাপ (Android / iOS)' : '📱 Mobile App'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'desktop'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>{lang === 'bn' ? '💻 ডেক্সটপ অ্যাপ (PC / Laptop)' : '💻 Desktop App'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {activeTab === 'mobile' ? (
            /* MOBILE TAB CONTENT */
            <div className="space-y-4">
              {/* Android Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {lang === 'bn' ? 'অ্যান্ড্রয়েড ফোন (Android)' : 'Android Installation'}
                      </h4>
                      <p className="text-[11px] text-slate-500">Google Chrome, Edge, Brave or Samsung Internet</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Recommended
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-700">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">1</span>
                    <p className="font-semibold text-slate-900">{lang === 'bn' ? 'ব্রাউজার মেন্যু' : 'Open Menu'}</p>
                    <p className="text-slate-500">{lang === 'bn' ? 'Chrome এর উপরের ৩টি ডটে (⋮) চাপ দিন' : 'Tap the 3 dots (⋮) in Chrome toolbar'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">2</span>
                    <p className="font-semibold text-slate-900">{lang === 'bn' ? 'অ্যাপ ইনস্টল' : 'Install App'}</p>
                    <p className="text-slate-500">{lang === 'bn' ? '"Install app" বা "Add to Home Screen" এ চাপুন' : 'Select "Install app" or "Add to Home screen"'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">3</span>
                    <p className="font-semibold text-slate-900">{lang === 'bn' ? 'তাত্ক্ষণিক চালু' : 'Instant Launch'}</p>
                    <p className="text-slate-500">{lang === 'bn' ? 'মোবাইলের হোম স্ক্রিন থেকে ফুল স্ক্রিনে চলবে' : 'Launches as a native app from home screen'}</p>
                  </div>
                </div>
              </div>

              {/* iOS / iPhone Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍎</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {lang === 'bn' ? 'আইফোন / আইপ্যাড (iPhone / iPad)' : 'iPhone / iPad (Apple iOS)'}
                    </h4>
                    <p className="text-[11px] text-slate-500">Safari Browser</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-700">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">1</span>
                    <p className="font-semibold text-slate-900">{lang === 'bn' ? 'শেয়ার বাটন' : 'Share Button'}</p>
                    <p className="text-slate-500">{lang === 'bn' ? 'Safari এর নিচের শেয়ার আইকনে (↑) চাপ দিন' : 'Tap the Share icon (box with arrow ↑) in Safari'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">2</span>
                    <p className="font-semibold text-slate-900">{lang === 'bn' ? 'হোম স্ক্রিনে যোগ' : 'Add to Home'}</p>
                    <p className="text-slate-500">{lang === 'bn' ? 'নিচে স্ক্রল করে "Add to Home Screen" চাপুন' : 'Scroll down & tap "Add to Home Screen" (+)'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">3</span>
                    <p className="font-semibold text-slate-900">{lang === 'bn' ? 'যুক্ত করুন' : 'Tap Add'}</p>
                    <p className="text-slate-500">{lang === 'bn' ? 'উপরের ডান কোণায় "Add" চাপলেই প্রস্তুত' : 'Tap "Add" in top-right. App is ready!'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* DESKTOP TAB CONTENT */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💻</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {lang === 'bn' ? 'উইন্ডোজ, ম্যাক ও লিনাক্স পিসি' : 'Windows, macOS & Linux PC'}
                      </h4>
                      <p className="text-[11px] text-slate-500">Google Chrome, Microsoft Edge, Brave</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Desktop Window
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-700">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">1</span>
                    <p className="font-semibold text-slate-900">{lang === 'bn' ? 'অ্যাড্রেস বার' : 'Address Bar Icon'}</p>
                    <p className="text-slate-500">{lang === 'bn' ? 'ব্রাউজার URL বারের ডানে ইনস্টল আইকনে চাপুন' : 'Click the install icon (⤓) in URL address bar'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">2</span>
                    <p className="font-semibold text-slate-900">{lang === 'bn' ? 'কনফার্মেশন' : 'Confirm Install'}</p>
                    <p className="text-slate-500">{lang === 'bn' ? '"Install" বাটনে ক্লিক করে ডেস্কটপ অ্যাপ বানান' : 'Click "Install" to create standalone app'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">3</span>
                    <p className="font-semibold text-slate-900">{lang === 'bn' ? 'ডেস্কটপ শর্টকাট' : 'Desktop Shortcut'}</p>
                    <p className="text-slate-500">{lang === 'bn' ? 'স্টার্ট মেনু বা টাস্কবার থেকে সরাসরি ওপেন হবে' : 'Launches in dedicated window from Taskbar'}</p>
                  </div>
                </div>
              </div>

              {/* Desktop App Advantages */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs text-indigo-950">
                <p className="font-bold flex items-center gap-1.5 text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  {lang === 'bn' ? 'ডেস্কটপ অ্যাপের বিশেষ সুবিধাসমূহ:' : 'Key Desktop App Advantages:'}
                </p>
                <ul className="space-y-1 text-[11px] text-indigo-800 pl-4 list-disc">
                  <li>{lang === 'bn' ? 'ব্রাউজারের ট্যাব বা অ্যাড্রেস বার ছাড়াই পরিষ্কার ফুল ভিউ' : 'Dedicated borderless window without browser tabs'}</li>
                  <li>{lang === 'bn' ? 'উইন্ডোজ টাস্কবারে পিন করে ১-ক্লিকে অ্যাক্সেস' : 'Pin to Windows Taskbar or macOS Dock for 1-click access'}</li>
                  <li>{lang === 'bn' ? 'দ্রুত ইউপিআই ডিসবার্সমেন্ট ও ফটো জুম ড্রয়ার' : 'Lightning-fast proof verification and lightbox inspections'}</li>
                </ul>
              </div>
            </div>
          )}

          {/* App Core Features Grid */}
          <div className="pt-2 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-900 mb-2">
              {lang === 'bn' ? 'অ্যাপের প্রধান সুবিধাসমূহ' : 'App Core Features & Performance'}
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-900">0.2s Speed</p>
                <p className="text-[9px] text-slate-500">{lang === 'bn' ? 'তাত্ক্ষণিক লোডিং' : 'Instant Load'}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <WifiOff className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-900">Offline Cache</p>
                <p className="text-[9px] text-slate-500">{lang === 'bn' ? 'অফলাইনেও অফার' : 'Browse Offline'}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <ShieldCheck className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-900">100% Safe</p>
                <p className="text-[9px] text-slate-500">{lang === 'bn' ? 'এনক্রিপ্টেড ডাটা' : 'Secure Storage'}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <Layers className="w-4 h-4 text-sky-500 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-900">0 MB Size</p>
                <p className="text-[9px] text-slate-500">{lang === 'bn' ? 'মেমোরি সেভার' : 'No bloatware'}</p>
              </div>
            </div>
          </div>

          {/* Share / Copy App Link for Mobile */}
          <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-800">
                {lang === 'bn' ? 'মোবাইলে লিংক পাঠাতে চান?' : 'Open on your mobile phone:'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{currentUrl}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">{lang === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{lang === 'bn' ? 'কপি লিংক' : 'Copy Link'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            {lang === 'bn' ? 'উইন্ডোজ, ম্যাক, অ্যান্ড্রয়েড ও আইওএস সাপোর্টেড' : 'Supports Android, iOS, Windows, macOS & Linux'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
