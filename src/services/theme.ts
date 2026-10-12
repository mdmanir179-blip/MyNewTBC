import { ThemeColor, ThemeConfig } from '../types/wms';

const STORAGE_KEY_THEME = 'tbc_wms_theme_color_v2';

export const THEMES: ThemeConfig[] = [
  {
    id: 'indigo',
    nameEn: 'Indigo Pro',
    nameBn: 'ইন্ডিগো ব্লু',
    primaryClass: 'bg-indigo-600',
    primaryBg: 'bg-indigo-600',
    primaryHoverBg: 'hover:bg-indigo-700',
    primaryText: 'text-indigo-600',
    borderClass: 'border-indigo-200',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    gradientFrom: 'from-indigo-600',
    gradientTo: 'to-violet-600',
    shadowColor: 'shadow-indigo-500/25',
    ringFocus: 'focus:ring-indigo-500'
  },
  {
    id: 'emerald',
    nameEn: 'Emerald Green',
    nameBn: 'পান্না সবুজ (Emerald)',
    primaryClass: 'bg-emerald-600',
    primaryBg: 'bg-emerald-600',
    primaryHoverBg: 'hover:bg-emerald-700',
    primaryText: 'text-emerald-600',
    borderClass: 'border-emerald-200',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-teal-600',
    shadowColor: 'shadow-emerald-500/25',
    ringFocus: 'focus:ring-emerald-500'
  },
  {
    id: 'blue',
    nameEn: 'Royal Blue',
    nameBn: 'রয়েল ব্লু (Royal Blue)',
    primaryClass: 'bg-blue-600',
    primaryBg: 'bg-blue-600',
    primaryHoverBg: 'hover:bg-blue-700',
    primaryText: 'text-blue-600',
    borderClass: 'border-blue-200',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-cyan-600',
    shadowColor: 'shadow-blue-500/25',
    ringFocus: 'focus:ring-blue-500'
  },
  {
    id: 'violet',
    nameEn: 'Velvet Purple',
    nameBn: 'ভেলভেট বেগুনী (Purple)',
    primaryClass: 'bg-violet-600',
    primaryBg: 'bg-violet-600',
    primaryHoverBg: 'hover:bg-violet-700',
    primaryText: 'text-violet-600',
    borderClass: 'border-violet-200',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    badgeBorder: 'border-violet-200',
    gradientFrom: 'from-violet-600',
    gradientTo: 'to-purple-600',
    shadowColor: 'shadow-violet-500/25',
    ringFocus: 'focus:ring-violet-500'
  },
  {
    id: 'rose',
    nameEn: 'Crimson Rose',
    nameBn: 'রুবি লাল (Crimson)',
    primaryClass: 'bg-rose-600',
    primaryBg: 'bg-rose-600',
    primaryHoverBg: 'hover:bg-rose-700',
    primaryText: 'text-rose-600',
    borderClass: 'border-rose-200',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    gradientFrom: 'from-rose-600',
    gradientTo: 'to-pink-600',
    shadowColor: 'shadow-rose-500/25',
    ringFocus: 'focus:ring-rose-500'
  },
  {
    id: 'amber',
    nameEn: 'Sunset Amber',
    nameBn: 'সূর্যাস্ত গোল্ড (Amber)',
    primaryClass: 'bg-amber-600',
    primaryBg: 'bg-amber-600',
    primaryHoverBg: 'hover:bg-amber-700',
    primaryText: 'text-amber-600',
    borderClass: 'border-amber-200',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    gradientFrom: 'from-amber-600',
    gradientTo: 'to-orange-600',
    shadowColor: 'shadow-amber-500/25',
    ringFocus: 'focus:ring-amber-500'
  },
  {
    id: 'cyan',
    nameEn: 'Cyber Cyan',
    nameBn: 'সাইবার সায়ান (Cyan)',
    primaryClass: 'bg-cyan-600',
    primaryBg: 'bg-cyan-600',
    primaryHoverBg: 'hover:bg-cyan-700',
    primaryText: 'text-cyan-600',
    borderClass: 'border-cyan-200',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    badgeBorder: 'border-cyan-200',
    gradientFrom: 'from-cyan-600',
    gradientTo: 'to-teal-600',
    shadowColor: 'shadow-cyan-500/25',
    ringFocus: 'focus:ring-cyan-500'
  }
];

export const THEME_CONFIGS: Record<ThemeColor, ThemeConfig> = THEMES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {} as Record<ThemeColor, ThemeConfig>);

export const themeService = {
  getTheme(): ThemeColor {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved && THEME_CONFIGS[saved as ThemeColor]) {
        return saved as ThemeColor;
      }
    } catch {
      // fallback
    }
    return 'indigo';
  },

  setTheme(theme: ThemeColor): void {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {
      // ignore
    }
  },

  getConfig(theme: ThemeColor): ThemeConfig {
    return THEME_CONFIGS[theme] || THEME_CONFIGS.indigo;
  }
};
