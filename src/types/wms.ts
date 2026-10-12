export type Platform = 'Amazon' | 'Flipkart' | 'Blinkit' | 'Meesho' | 'Myntra' | 'Other';

export type ClaimStatus = 'Pending' | 'Approved' | 'Paid' | 'Rejected';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  note?: string;
  performedBy: string;
}

export interface WmsProduct {
  id: string;
  title: string;
  brand: string;
  platform: Platform;
  imageUrl: string;
  originalPrice: number;
  cashbackAmount: number;
  cashbackType: '100% Free' | 'Flat Cashback' | 'Review Bonus';
  specialCode: string;
  purchaseUrl: string;
  totalSlots: number;
  claimedSlots: number;
  status: 'active' | 'paused' | 'sold_out';
  instructions: string[];
  createdAt: string;
}

export interface WmsClaim {
  id: string;
  productId: string;
  productTitle: string;
  platform: Platform;
  cashbackAmount: number;
  systemCode: string;
  submittedCode: string;
  isCodeMatched: boolean;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  refundUpi: string;
  alternatePhone?: string;
  orderScreenshot: string;
  paymentScreenshot: string;
  ratingScreenshot: string;
  status: ClaimStatus;
  rejectionReason?: string;
  payoutRefNo?: string;
  paidAt?: string;
  submittedAt: string;
  auditLogs: AuditLogEntry[];
}

export interface UserSession {
  type: 'customer' | 'admin';
  name: string;
  phone?: string;
  email?: string;
  adminRole?: 'Super Admin' | 'Executive Admin' | 'Auditor' | 'Campaign Manager' | 'Finance Disburser' | string;
}

export interface WmsStats {
  totalClaims: number;
  pendingCount: number;
  approvedCount: number;
  paidCount: number;
  rejectedCount: number;
  totalCashbackPaid: number;
  totalCashbackCommitted: number;
}

export type ThemeColor = 'indigo' | 'emerald' | 'blue' | 'violet' | 'rose' | 'amber' | 'cyan';

export interface ThemeConfig {
  id: ThemeColor;
  nameEn: string;
  nameBn: string;
  primaryClass: string;
  primaryBg: string;
  primaryHoverBg: string;
  primaryText: string;
  borderClass: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  gradientFrom: string;
  gradientTo: string;
  shadowColor: string;
  ringFocus: string;
}
