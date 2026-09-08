/**
 * Tile Cache Service
 * Caches map tiles in localStorage and IndexedDB for offline use
 */

const CACHE_PREFIX = 'terramind_tile_';
const MAX_CACHE_SIZE_MB = 50;
const CACHE_VERSION = '1.0';

interface CacheMetadata {
  version: string;
  totalSize: number;
  lastCleanup: number;
}

class TileCache {
  private memoryCache = new Map<string, Blob>();
  private dbName = 'terramind-tiles';
  private storeName = 'tiles';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not supported, using memory cache only');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async get(key: string): Promise<Blob | null> {
    // Check memory first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)!;
    }

    // Check IndexedDB
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onsuccess = () => {
        if (request.result) {
          const blob = request.result.blob;
          this.memoryCache.set(key, blob);
          resolve(blob);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  async set(key: string, blob: Blob): Promise<void> {
    // Store in memory
    this.memoryCache.set(key, blob);
    
    // Limit memory cache size
    if (this.memoryCache.size > 100) {
      const firstKey = this.memoryCache.keys().next().value as string | undefined;
      if (firstKey) this.memoryCache.delete(firstKey);
    }

    // Store in IndexedDB
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({
        key,
        blob,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cleanup(): Promise<void> {
    if (!this.db) return;

    const metadata = this.getMetadata();
    if (metadata.totalSize < MAX_CACHE_SIZE_MB * 1024 * 1024) {
      return;
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.openCursor();
      let deleted = 0;
      const toDelete = Math.floor(this.memoryCache.size * 0.3); // Delete 30% of old entries

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && deleted < toDelete) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          this.updateMetadata({ lastCleanup: Date.now() });
          resolve();
        }
      };
    });
  }

  getMetadata(): CacheMetadata {
    const stored = localStorage.getItem(`${CACHE_PREFIX}metadata`);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      version: CACHE_VERSION,
      totalSize: 0,
      lastCleanup: Date.now()
    };
  }

  updateMetadata(partial: Partial<CacheMetadata>): void {
    const current = this.getMetadata();
    localStorage.setItem(`${CACHE_PREFIX}metadata`, JSON.stringify({
      ...current,
      ...partial
    }));
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    if (this.db) {
      return new Promise((resolve) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    }
  }

  getStats() {
    return {
      memoryEntries: this.memoryCache.size,
      version: CACHE_VERSION,
      maxSize: MAX_CACHE_SIZE_MB
    };
  }
}

export const tileCache = new TileCache();

/**
 * Fetch with cache
 * Attempts to get tile from cache, falls back to network
 */
export async function fetchWithCache(
  url: string,
  cacheKey: string
): Promise<Response> {
  // Try cache first
  const cached = await tileCache.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: { 'X-Cache': 'HIT' }
    });
  }

  // Fetch from network
  const response = await fetch(url);
  if (response.ok) {
    const blob = await response.clone().blob();
    await tileCache.set(cacheKey, blob);
  }
  
  return response;
}
