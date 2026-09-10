/** Keep existing browser records intact when new writes exceed storage limits. */
type StorageType = 'session' | 'local' | 'memory';

class UniversalStorage {
  private activeStorage: StorageType = 'memory';
  private storage: Storage | null = null;
  // null is a pending removal; a string is a newer value that could not persist.
  private pending = new Map<string, string | null>();
  private clearPending = false;
  private listeners = new Set<() => void>();

  constructor() {
    if (typeof window === 'undefined') return;
    for (const [name, type] of [['sessionStorage', 'session'], ['localStorage', 'local']] as const) {
      try {
        const candidate = window[name];
        // Read-only detection preserves existing records even when storage is full.
        void candidate.length;
        this.storage = candidate;
        this.activeStorage = type;
        break;
      } catch {
        // A blocked backend can still fall back to a readable one or memory.
      }
    }
  }

  getStorageType(): StorageType {
    return this.pending.size || this.clearPending ? 'memory' : this.activeStorage;
  }

  isAvailable(): boolean {
    return true; // Memory remains usable even when browser persistence is blocked.
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notifyIfChanged(previous: StorageType): void {
    if (previous !== this.getStorageType()) {
      for (const listener of this.listeners) listener();
    }
  }

  getItem(key: string): string | null {
    if (this.pending.has(key)) return this.pending.get(key) ?? null;
    if (this.clearPending) return null;
    try {
      return this.storage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  /** True means available for this page session, not necessarily persisted. */
  setItem(key: string, value: string): boolean {
    const previous = this.getStorageType();
    try {
      if (!this.storage) throw new Error('Browser persistence unavailable');
      if (this.clearPending) {
        // Retry only a clear explicitly requested through clear(), never quota eviction.
        this.storage.clear();
        this.clearPending = false;
      }
      this.storage.setItem(key, value);
      this.pending.delete(key);
    } catch {
      // Never delete another key or abandon readable durable records to make room.
      this.pending.set(key, value);
    }
    this.notifyIfChanged(previous);
    return true;
  }

  removeItem(key: string): void {
    const previous = this.getStorageType();
    try {
      this.storage?.removeItem(key);
      this.pending.delete(key);
    } catch {
      this.pending.set(key, null);
    }
    this.notifyIfChanged(previous);
  }

  /** Explicit caller-requested reset; no automatic quota recovery invokes this. */
  clear(): void {
    const previous = this.getStorageType();
    try {
      this.storage?.clear();
      this.clearPending = false;
    } catch {
      this.clearPending = true;
    }
    this.pending.clear();
    this.notifyIfChanged(previous);
  }

  getAllKeys(): string[] {
    let durable: string[] = [];
    if (!this.clearPending) {
      try { durable = this.storage ? Object.keys(this.storage) : []; } catch { /* Readable pending values still work. */ }
    }
    const keys = new Set(durable);
    for (const [key, value] of this.pending) {
      if (value === null) keys.delete(key);
      else keys.add(key);
    }
    return [...keys];
  }

  /** Origin storage estimate; this is not an exact sessionStorage quota. */
  async estimateSpace(): Promise<{ usage: number; quota: number } | null> {
    if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null;
    try {
      const { usage, quota } = await navigator.storage.estimate();
      if (!Number.isFinite(usage) || !Number.isFinite(quota) || (quota ?? 0) <= 0) return null;
      return { usage: usage!, quota: quota! };
    } catch {
      return null;
    }
  }
}

export const universalStorage = new UniversalStorage();

export async function isStorageCriticallyLow(): Promise<boolean> {
  const estimate = await universalStorage.estimateSpace();
  return estimate !== null && estimate.usage / estimate.quota > 0.9;
}
