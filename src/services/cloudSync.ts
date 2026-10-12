import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { WmsProduct, WmsClaim } from '../types/wms';

const STORAGE_KEY_PRODUCTS = 'wms_portal_products_v2';
const STORAGE_KEY_CLAIMS = 'wms_portal_claims_v2';
const STORAGE_KEY_TIMESTAMP = 'wms_portal_products_timestamp';
const BROADCAST_CHANNEL_NAME = 'tbc_wms_realtime_broadcast_v3';

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // BroadcastChannel fallback
}

interface SyncPayload {
  type: 'SYNC_PRODUCTS' | 'PRODUCT_DELETED' | 'PRODUCT_ADDED' | 'PRODUCT_UPDATED' | 'SYNC_ALL' | 'CLAIM_ADDED' | 'CLAIM_UPDATED';
  productId?: string;
  claimId?: string;
  products?: WmsProduct[];
  claims?: WmsClaim[];
  timestamp: number;
}

export const cloudSync = {
  // Broadcast an immediate local update to all open tabs and windows (0ms latency)
  broadcast(type: SyncPayload['type'], products?: WmsProduct[], productId?: string): void {
    const timestamp = Date.now();
    if (products) {
      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
        localStorage.setItem(STORAGE_KEY_TIMESTAMP, timestamp.toString());
      } catch {}
    }

    const payload: SyncPayload = {
      type,
      productId,
      products,
      timestamp
    };

    // 1. Send via BroadcastChannel (instant cross-tab communication)
    try {
      if (broadcastChannel) {
        broadcastChannel.postMessage(payload);
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    // 2. Dispatch window event for current document
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tbc_wms_local_sync', { detail: payload }));
    }
  },

  // Save product to Firebase Firestore + Server endpoint
  async saveProductToServer(product: WmsProduct): Promise<void> {
    // 1. Firestore Cloud Database (Guarantees persistence across all devices, mobile, computer & Vercel)
    try {
      const productRef = doc(db, 'products', product.id);
      await setDoc(productRef, product, { merge: true });
    } catch (e) {
      console.warn('Firestore product save warning:', e);
    }

    // 2. Server API fallback (Express/Local dev)
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
    } catch {
      // Ignored on serverless Vercel if /api is handled via static/firestore
    }
  },

  // Delete product from Firestore + Server endpoint
  async deleteProductFromServer(productId: string): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);
    } catch (e) {
      console.warn('Firestore delete error:', e);
    }

    try {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
    } catch {}
  },

  // Clean slate on Firestore + Server
  async cleanSlateOnServer(): Promise<void> {
    try {
      const productsSnap = await getDocs(collection(db, 'products'));
      const batch = writeBatch(db);
      productsSnap.forEach(d => {
        batch.delete(d.ref);
      });
      await batch.commit();
    } catch (e) {
      console.warn('Firestore clean slate warning:', e);
    }

    try {
      await fetch('/api/clean-slate', { method: 'POST' });
    } catch {}

    this.broadcast('SYNC_ALL', []);
  },

  // Reset demo on server
  async resetDemoOnServer(): Promise<void> {
    try {
      await fetch('/api/reset-demo', { method: 'POST' });
    } catch {}
  },

  // Save claim to Firestore
  async saveClaimToCloud(claim: WmsClaim): Promise<void> {
    try {
      const claimRef = doc(db, 'claims', claim.id);
      await setDoc(claimRef, claim, { merge: true });
    } catch (e) {
      console.warn('Firestore saveClaim error:', e);
    }

    try {
      await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claim)
      });
    } catch {}
  },

  // Fetch latest products from Firestore (or server fallback)
  async fetchProducts(): Promise<WmsProduct[] | null> {
    // 1. Try Firestore first
    try {
      const productsSnap = await getDocs(collection(db, 'products'));
      if (!productsSnap.empty) {
        const firestoreProducts: WmsProduct[] = [];
        productsSnap.forEach(docSnap => {
          firestoreProducts.push(docSnap.data() as WmsProduct);
        });
        return firestoreProducts;
      }
    } catch (e) {
      console.warn('Firestore fetch products failed, checking fallback:', e);
    }

    // 2. Try Server API fallback
    try {
      const res = await fetch(`/api/products?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products)) {
          return data.products;
        }
      }
    } catch {
      // offline fallback
    }

    return null;
  },

  // Fetch latest claims from Firestore
  async fetchClaims(): Promise<WmsClaim[] | null> {
    try {
      const claimsSnap = await getDocs(collection(db, 'claims'));
      if (!claimsSnap.empty) {
        const firestoreClaims: WmsClaim[] = [];
        claimsSnap.forEach(docSnap => {
          firestoreClaims.push(docSnap.data() as WmsClaim);
        });
        return firestoreClaims;
      }
    } catch (e) {
      console.warn('Firestore fetch claims failed:', e);
    }

    try {
      const res = await fetch(`/api/claims?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.claims)) {
          return data.claims;
        }
      }
    } catch {}

    return null;
  },

  // Subscribe to real-time events across all devices & tabs
  subscribe(
    onProductsChange: (products: WmsProduct[]) => void,
    onClaimsChange?: (claims: WmsClaim[]) => void
  ): () => void {
    if (typeof window === 'undefined') return () => {};

    // 1. Live Firestore Real-Time Listener (Instant cross-device push across mobile, laptop, Vercel)
    let unsubscribeFirestoreProducts: (() => void) | null = null;
    let unsubscribeFirestoreClaims: (() => void) | null = null;

    try {
      const productsCol = collection(db, 'products');
      unsubscribeFirestoreProducts = onSnapshot(productsCol, (snapshot) => {
        const items: WmsProduct[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as WmsProduct);
        });
        try {
          localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(items));
        } catch {}
        onProductsChange(items);
      }, (error) => {
        console.warn('Firestore products onSnapshot listener error:', error);
      });
    } catch (e) {
      console.warn('Failed to attach Firestore products snapshot:', e);
    }

    if (onClaimsChange) {
      try {
        const claimsCol = collection(db, 'claims');
        unsubscribeFirestoreClaims = onSnapshot(claimsCol, (snapshot) => {
          const items: WmsClaim[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as WmsClaim);
          });
          try {
            localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(items));
          } catch {}
          onClaimsChange(items);
        }, (error) => {
          console.warn('Firestore claims onSnapshot listener error:', error);
        });
      } catch (e) {
        console.warn('Failed to attach Firestore claims snapshot:', e);
      }
    }

    // 2. BroadcastChannel (Same browser instant cross-tab)
    const handleBroadcast = (event: MessageEvent<SyncPayload>) => {
      if (event.data && Array.isArray(event.data.products)) {
        try {
          localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(event.data.products));
        } catch {}
        onProductsChange(event.data.products);
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }

    // 3. Local custom event (current tab)
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SyncPayload>;
      if (customEvent.detail && Array.isArray(customEvent.detail.products)) {
        try {
          localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(customEvent.detail.products));
        } catch {}
        onProductsChange(customEvent.detail.products);
      }
    };
    window.addEventListener('tbc_wms_local_sync', handleCustomEvent);

    // 4. Storage event
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_PRODUCTS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            onProductsChange(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // 5. Visibility and Focus sync (wakes up mobile devices to guarantee freshest state)
    const handleVisibilityOrFocus = () => {
      cloudSync.fetchProducts().then((serverProducts) => {
        if (serverProducts && Array.isArray(serverProducts)) {
          localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(serverProducts));
          onProductsChange(serverProducts);
        }
      }).catch(() => {});

      if (onClaimsChange) {
        cloudSync.fetchClaims().then((serverClaims) => {
          if (serverClaims && Array.isArray(serverClaims)) {
            localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(serverClaims));
            onClaimsChange(serverClaims);
          }
        }).catch(() => {});
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    // Cleanup subscription
    return () => {
      if (unsubscribeFirestoreProducts) {
        unsubscribeFirestoreProducts();
      }
      if (unsubscribeFirestoreClaims) {
        unsubscribeFirestoreClaims();
      }
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('tbc_wms_local_sync', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }
};
