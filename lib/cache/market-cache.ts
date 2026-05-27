export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  updatedAt: number;
}

export class MarketCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): CacheEntry<T> | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry;
  }

  set(key: string, value: T, ttlMs?: number): CacheEntry<T> {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      value,
      updatedAt: now,
      expiresAt: now + (ttlMs ?? this.ttlMs),
    };
    this.store.set(key, entry);
    return entry;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
