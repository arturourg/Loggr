class Cache {
  constructor(ttlMinutes = 10) {
    this.cache = new Map();
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export default Cache;
