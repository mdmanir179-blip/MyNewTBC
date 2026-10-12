import { WmsProduct } from '../types/wms';

const STORAGE_KEY_PRODUCTS = 'wms_portal_products_v2';
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
  type: 'SYNC_PRODUCTS' | 'PRODUCT_DELETED' | 'PRODUCT_ADDED' | 'PRODUCT_UPDATED' | 'SYNC_ALL';
  productId?: string;
  products: WmsProduct[];
  timestamp: number;
}

export const cloudSync = {
  // Broadcast an immediate local update to all open tabs and windows (0ms latency)
  broadcast(type: SyncPayload['type'], products: WmsProduct[], productId?: string): void {
    const timestamp = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEY_TIMESTAMP, timestamp.toString());
    } catch {}

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

  // Notify server of product addition/edit and return authoritative server state
  async saveProductToServer(product: WmsProduct): Promise<WmsProduct[] | null> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products)) {
          this.broadcast('SYNC_PRODUCTS', data.products, product.id);
          return data.products;
        }
      }
    } catch (e) {
      console.warn('Failed to save product to server:', e);
    }
    return null;
  },

  // Notify server of product update
  async updateProductOnServer(productId: string, updates: Partial<WmsProduct>): Promise<WmsProduct[] | null> {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products)) {
          this.broadcast('PRODUCT_UPDATED', data.products, productId);
          return data.products;
        }
      }
    } catch (e) {
      console.warn('Failed to update product on server:', e);
    }
    return null;
  },

  // Notify server of product deletion and return updated authoritative state
  async deleteProductFromServer(productId: string): Promise<WmsProduct[] | null> {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products)) {
          this.broadcast('PRODUCT_DELETED', data.products, productId);
          return data.products;
        }
      }
    } catch (e) {
      console.warn('Failed to delete product from server:', e);
    }
    return null;
  },

  // Notify server of clean slate
  async cleanSlateOnServer(): Promise<void> {
    try {
      await fetch('/api/clean-slate', {
        method: 'POST'
      });
      this.broadcast('SYNC_ALL', []);
    } catch {
      // offline / static fallback
    }
  },

  // Notify server of demo data reset
  async resetDemoOnServer(): Promise<void> {
    try {
      await fetch('/api/reset-demo', {
        method: 'POST'
      });
    } catch {
      // offline / static fallback
    }
  },

  // Fetch latest authoritative products from server
  async fetchProducts(): Promise<WmsProduct[] | null> {
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

  // Subscribe to real-time events (Server-Sent Events for cross-device + BroadcastChannel for cross-tab)
  subscribe(onProductsChange: (products: WmsProduct[]) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    // 1. Handler for BroadcastChannel (cross-tab)
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

    // 2. Handler for local custom event (same page)
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

    // 3. Native storage event (across browser tabs)
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

    // 4. Server-Sent Events (SSE) for Real-Time Cross-Device Sync (0ms delay across all devices)
    let eventSource: EventSource | null = null;
    const connectSSE = () => {
      try {
        if (eventSource) {
          eventSource.close();
        }
        eventSource = new EventSource('/api/events');
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.type === 'SYNC_PRODUCTS' && Array.isArray(data.payload)) {
              localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(data.payload));
              onProductsChange(data.payload);
            } else if (data && data.type === 'SYNC_ALL' && data.payload && Array.isArray(data.payload.products)) {
              localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(data.payload.products));
              onProductsChange(data.payload.products);
            }
          } catch {}
        };
        eventSource.onerror = () => {
          // SSE auto-reconnects in modern browsers
        };
      } catch {}
    };
    connectSSE();

    // 5. Fast 1.2s Polling fallback (guarantees cross-device sync even if SSE is blocked or mobile wakes up)
    let isFetching = false;
    const pollInterval = setInterval(async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        const serverProducts = await cloudSync.fetchProducts();
        if (serverProducts && Array.isArray(serverProducts)) {
          const localStr = localStorage.getItem(STORAGE_KEY_PRODUCTS) || '[]';
          const serverStr = JSON.stringify(serverProducts);
          if (localStr !== serverStr) {
            localStorage.setItem(STORAGE_KEY_PRODUCTS, serverStr);
            onProductsChange(serverProducts);
          }
        }
      } catch {
        // silent
      } finally {
        isFetching = false;
      }
    }, 1200);

    // 6. Immediate sync on window focus or visibility change (when unlocking phone or switching back to browser)
    const handleVisibilityOrFocus = () => {
      cloudSync.fetchProducts().then((serverProducts) => {
        if (serverProducts && Array.isArray(serverProducts)) {
          localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(serverProducts));
          onProductsChange(serverProducts);
        }
      }).catch(() => {});
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    // Initial server fetch to align device data immediately on load
    cloudSync.fetchProducts().then((serverProducts) => {
      if (serverProducts && Array.isArray(serverProducts)) {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(serverProducts));
        onProductsChange(serverProducts);
      }
    }).catch(() => {});

    // Cleanup subscription
    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('tbc_wms_local_sync', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(pollInterval);
    };
  }
};
