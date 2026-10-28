/**
 * In-memory & session cache for ultra-fast instantaneous navigation
 * Implements Stale-While-Revalidate pattern:
 * - Return cached data immediately (0ms)
 * - Fetch fresh data in the background
 */

const memoryCache = new Map();

export function getCached(key) {
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }
  try {
    const raw = sessionStorage.getItem(`msd_cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      memoryCache.set(key, parsed);
      return parsed;
    }
  } catch (e) {
    // Ignore storage issues
  }
  return null;
}

export function setCached(key, data) {
  memoryCache.set(key, data);
  try {
    sessionStorage.setItem(`msd_cache_${key}`, JSON.stringify(data));
  } catch (e) {
    // Ignore storage quota
  }
}

export function invalidateCached(key) {
  memoryCache.delete(key);
  try {
    sessionStorage.removeItem(`msd_cache_${key}`);
  } catch (e) {
    // Ignore
  }
}

/**
 * Pre-fetch an API endpoint into cache on hover or background
 */
export function prefetchApi(endpoint, key = endpoint) {
  return fetch(`/api/${endpoint}`)
    .then(r => r.json())
    .then(d => {
      if (d.status === 'success' && d.data) {
        setCached(key, d.data);
        return d.data;
      }
    })
    .catch(() => null);
}
