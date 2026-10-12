import { WmsProduct, WmsClaim, ClaimStatus, AuditLogEntry } from '../types/wms';
import { cloudSync } from './cloudSync';

// Import high-fidelity generated images
import headphonesImg from '../assets/images/wms_prod_headphones_1790431718531.jpg';
import smartwatchImg from '../assets/images/wms_prod_smartwatch_1790431732200.jpg';
import coffeeImg from '../assets/images/wms_prod_coffee_1790431744686.jpg';
import mouseImg from '../assets/images/wms_prod_mouse_1790431756712.jpg';

const STORAGE_KEY_PRODUCTS = 'wms_portal_products_v2';
const STORAGE_KEY_CLAIMS = 'wms_portal_claims_v2';
const STORAGE_KEY_USER = 'wms_portal_user_v2';

// High-quality SVG/DataURI proof samples for testing
export const DEMO_PROOFS = {
  order: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="%230f172a"><rect width="100%" height="100%" fill="%230f172a"/><rect x="40" y="40" width="520" height="720" rx="16" fill="%231e293b" stroke="%23334155" stroke-width="2"/><text x="70" y="100" fill="%2338bdf8" font-family="sans-serif" font-weight="bold" font-size="22">ORDER CONFIRMATION</text><text x="70" y="140" fill="%2394a3b8" font-family="sans-serif" font-size="14">Order ID: %23402-9812491-18239</text><text x="70" y="170" fill="%23e2e8f0" font-family="sans-serif" font-size="16">Status: Delivered Successfully</text><line x1="70" y1="200" x2="530" y2="200" stroke="%23475569" stroke-width="1"/><text x="70" y="240" fill="%23cbd5e1" font-family="sans-serif" font-size="14">Delivery Address: Bangalore 560034</text><text x="70" y="280" fill="%2310b981" font-family="sans-serif" font-weight="bold" font-size="18">Total Paid: INR 1,499.00</text><rect x="70" y="320" width="460" height="200" rx="12" fill="%230f172a" stroke="%23334155"/><text x="100" y="390" fill="%2394a3b8" font-family="monospace" font-size="14">Verified Merchant Dispatch Proof</text><text x="100" y="430" fill="%2364748b" font-family="monospace" font-size="12">Timestamp: 2026-09-24 14:32:10 UTC</text></svg>`,
  payment: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="%23064e3b"><rect width="100%" height="100%" fill="%23064e3b"/><rect x="40" y="40" width="520" height="720" rx="16" fill="%23065f46" stroke="%23047857" stroke-width="2"/><circle cx="300" cy="180" r="50" fill="%2310b981"/><path d="M280 180 L295 195 L325 165" stroke="%23ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><text x="300" y="270" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-weight="bold" font-size="24">UPI PAYMENT SUCCESSFUL</text><text x="300" y="320" text-anchor="middle" fill="%23a7f3d0" font-family="sans-serif" font-weight="bold" font-size="32">INR 1,499.00</text><text x="300" y="370" text-anchor="middle" fill="%236ee7b7" font-family="monospace" font-size="14">UPI Ref / UTR: 426819208492</text><line x1="70" y1="420" x2="530" y2="420" stroke="%23047857" stroke-width="1"/><text x="70" y="470" fill="%23d1fae5" font-family="sans-serif" font-size="14">To: Merchant Official Store</text><text x="70" y="510" fill="%23d1fae5" font-family="sans-serif" font-size="14">From Account: AXIS BANK ...8812</text></svg>`,
  rating: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="%23451a03"><rect width="100%" height="100%" fill="%23451a03"/><rect x="40" y="40" width="520" height="720" rx="16" fill="%2378350f" stroke="%23b45309" stroke-width="2"/><text x="70" y="110" fill="%23fde68a" font-family="sans-serif" font-weight="bold" font-size="22">5-STAR RATING &amp; REVIEW</text><text x="70" y="160" fill="%23fbbf24" font-family="sans-serif" font-size="28">★★★★★</text><text x="70" y="210" fill="%23ffffff" font-family="sans-serif" font-weight="bold" font-size="16">"Exceptional quality, super fast delivery!"</text><text x="70" y="250" fill="%23fed7aa" font-family="sans-serif" font-size="13">Reviewed in India with Verified Purchase badge.</text><rect x="70" y="290" width="460" height="380" rx="12" fill="%23451a03" stroke="%2392400e"/><text x="95" y="340" fill="%23fef3c7" font-family="sans-serif" font-size="14">Customer feedback is live and publicly listed.</text><text x="95" y="380" fill="%23d97706" font-family="monospace" font-size="12">Helpful votes: 12 · Public profile match</text></svg>`
};

// Clean initial state: No demo products and no demo user IDs/claims
export const INITIAL_PRODUCTS: WmsProduct[] = [];
export const INITIAL_CLAIMS: WmsClaim[] = [];

const DEMO_PRODUCT_IDS = new Set(['PROD-101', 'PROD-102', 'PROD-103', 'PROD-104']);
const DEMO_CLAIM_IDS = new Set(['CLM-2026-8801', 'CLM-2026-8802', 'CLM-2026-8803', 'CLM-2026-8804', 'CLM-4821']);
const STORAGE_KEY_ADMIN_ACCOUNTS = 'wms_portal_admin_accounts_v2';

export interface StoredAdminAccount {
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
}

export const storage = {
  // Admin accounts storage and authentication
  getAdminAccounts(): StoredAdminAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ADMIN_ACCOUNTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    // Default master admin account
    const defaultAdmins: StoredAdminAccount[] = [
      {
        name: 'Executive Admin',
        email: 'admin',
        password: 'admin',
        role: 'Executive Admin',
        createdAt: '2026-01-01'
      }
    ];
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_ACCOUNTS, JSON.stringify(defaultAdmins));
    } catch {}
    return defaultAdmins;
  },

  registerAdmin(account: { name: string; email: string; password: string; role?: string }): { success: boolean; message: string; session?: any } {
    const list = this.getAdminAccounts();
    const cleanEmail = account.email.trim().toLowerCase();
    const exists = list.some(a => a.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: 'An admin account with this ID/Email already exists.' };
    }
    const newAdmin: StoredAdminAccount = {
      name: account.name.trim(),
      email: cleanEmail,
      password: account.password.trim(),
      role: account.role?.trim() || 'Administrator',
      createdAt: new Date().toISOString()
    };
    list.push(newAdmin);
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_ACCOUNTS, JSON.stringify(list));
    } catch {}
    return {
      success: true,
      message: 'Admin account created successfully.',
      session: {
        type: 'admin',
        name: newAdmin.name,
        email: newAdmin.email,
        adminRole: newAdmin.role
      }
    };
  },

  authenticateAdmin(idOrEmail: string, pass: string): { type: 'admin'; name: string; email: string; adminRole: string } | null {
    const cleanId = idOrEmail.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Built-in emergency super admin check
    if ((cleanId === 'admin' || cleanId === 'admin@tbcwms.com') && (cleanPass === 'admin' || cleanPass === 'admin123')) {
      return {
        type: 'admin',
        name: 'Executive Admin',
        email: 'admin@tbcwms.com',
        adminRole: 'Executive Admin'
      };
    }

    const accounts = this.getAdminAccounts();
    const found = accounts.find(a => (a.email.toLowerCase() === cleanId || a.email.toLowerCase() === cleanId.replace('@tbcwms.com', '')) && a.password === cleanPass);
    if (found) {
      return {
        type: 'admin',
        name: found.name,
        email: found.email,
        adminRole: found.role
      };
    }
    return null;
  },

  getProducts(): WmsProduct[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (data !== null) {
        let parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          // Purge legacy demo product IDs so user starts with a clean slate
          const cleaned = parsed.filter(p => !DEMO_PRODUCT_IDS.has(p.id));
          if (cleaned.length !== parsed.length) {
            this.saveProducts(cleaned);
            return cleaned;
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return [];
  },

  saveProducts(products: WmsProduct[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('localStorage quota reached or unavailable:', e);
    }
  },

  getClaims(): WmsClaim[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CLAIMS);
      if (data !== null) {
        let parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(c => !DEMO_CLAIM_IDS.has(c.id));
          if (cleaned.length !== parsed.length) {
            this.saveClaims(cleaned);
            return cleaned;
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return [];
  },

  saveClaims(claims: WmsClaim[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(claims));
    } catch (e) {
      console.warn('localStorage saveClaims quota error:', e);
    }
  },

  addClaim(claim: WmsClaim): void {
    const claims = this.getClaims();
    claims.unshift(claim);
    this.saveClaims(claims);

    // Update claimedSlots on product
    const products = this.getProducts();
    const prod = products.find(p => p.id === claim.productId);
    if (prod) {
      prod.claimedSlots += 1;
      this.saveProducts(products);
    }

    try {
      fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claim)
      }).catch(() => {});
    } catch {}
  },

  updateClaim(claimId: string, updates: Partial<WmsClaim>, adminName = 'Executive Admin'): WmsClaim | null {
    const claims = this.getClaims();
    const index = claims.findIndex(c => c.id === claimId);
    if (index === -1) return null;

    const existing = claims[index];
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newLogs: AuditLogEntry[] = [...(existing.auditLogs || [])];
    if (updates.status && updates.status !== existing.status) {
      newLogs.push({
        id: `log-${Date.now()}`,
        timestamp: now,
        action: `Status Changed to ${updates.status}`,
        note: updates.rejectionReason || (updates.payoutRefNo ? `Payout UTR: ${updates.payoutRefNo}` : undefined),
        performedBy: adminName
      });
    }

    const updated: WmsClaim = {
      ...existing,
      ...updates,
      auditLogs: newLogs
    };

    claims[index] = updated;
    this.saveClaims(claims);

    try {
      fetch(`/api/claims/${claimId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }).catch(() => {});
    } catch {}

    return updated;
  },

  addProduct(product: WmsProduct): void {
    const products = this.getProducts();
    const existingIdx = products.findIndex(p => p.id === product.id);
    if (existingIdx !== -1) {
      products[existingIdx] = product;
    } else {
      products.unshift(product);
    }
    this.saveProducts(products);
    cloudSync.broadcast('PRODUCT_ADDED', products, product.id);
    cloudSync.saveProductToServer(product);
  },

  updateProduct(productId: string, updates: Partial<WmsProduct>): void {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...updates };
      this.saveProducts(products);
      cloudSync.broadcast('PRODUCT_UPDATED', products, productId);
      cloudSync.saveProductToServer(products[idx]);
    }
  },

  deleteProduct(productId: string): void {
    const products = this.getProducts().filter(p => p.id !== productId);
    this.saveProducts(products);
    cloudSync.broadcast('PRODUCT_DELETED', products, productId);
    cloudSync.deleteProductFromServer(productId);
  },

  recordPayout(claimId: string, utrRef: string, adminName = 'Executive Admin'): WmsClaim | null {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    return this.updateClaim(claimId, {
      status: 'Paid',
      payoutRefNo: utrRef,
      paidAt: now
    }, adminName);
  },

  resetToDemoData(): void {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(INITIAL_CLAIMS));
    cloudSync.broadcast('SYNC_PRODUCTS', INITIAL_PRODUCTS);
    cloudSync.resetDemoOnServer();
  },

  resetAllData(): void {
    this.resetToDemoData();
  },

  clearAllData(): void {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify([]));
    cloudSync.broadcast('SYNC_PRODUCTS', []);
    cloudSync.cleanSlateOnServer();
  },

  cleanSlate(): void {
    this.clearAllData();
  },

  exportClaimsAsCsv(): string {
    return this.exportClaimsToCsv(this.getClaims());
  },

  exportDatabaseJson(): string {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      claims: this.getClaims()
    };
    return JSON.stringify(data, null, 2);
  },

  importDatabaseJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.products) && Array.isArray(parsed.claims)) {
        this.saveProducts(parsed.products);
        this.saveClaims(parsed.claims);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  exportClaimsToCsv(claims: WmsClaim[]): string {
    const headers = [
      'Claim ID',
      'Submission Date',
      'Customer Name',
      'Mobile',
      'Email',
      'Product Title',
      'Platform',
      'Cashback Amount (INR)',
      'System Code',
      'Submitted Code',
      'Code Matched',
      'UPI ID',
      'Status',
      'Payout Ref No / UTR',
      'Paid Date',
      'Rejection Reason'
    ];

    const escapeCsv = (val: unknown) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = claims.map(c => [
      c.id,
      c.submittedAt,
      c.customerName,
      c.customerPhone,
      c.customerEmail,
      c.productTitle,
      c.platform,
      c.cashbackAmount,
      c.systemCode,
      c.submittedCode,
      c.isCodeMatched ? 'YES' : 'NO',
      c.refundUpi,
      c.status,
      c.payoutRefNo || '',
      c.paidAt || '',
      c.rejectionReason || ''
    ].map(escapeCsv).join(','));

    // UTF-8 BOM
    return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  }
};
