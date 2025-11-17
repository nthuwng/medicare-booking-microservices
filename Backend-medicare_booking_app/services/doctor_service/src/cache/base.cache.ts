// src/cache/base.cache.ts
import { redis } from "src/config/redis";

export const DEFAULT_CACHE_TTL_SECONDS = 600; // 10 phút

export const getJSONCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await redis.get(key);
    if (!cached) return null;
    return JSON.parse(cached) as T;
  } catch (error) {
    console.error(`[Redis] Error getting cache for ${key}:`, error);
    return null;
  }
};

export const setJSONCache = async (
  key: string,
  data: unknown,
  ttlSeconds: number = DEFAULT_CACHE_TTL_SECONDS
): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch (error) {
    console.error(`[Redis] Error setting cache for ${key}:`, error);
  }
};

export const clearByPrefix = async (prefix: string): Promise<void> => {
  try {
    const pattern = `${prefix}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`[Redis] Error clearing cache for prefix ${prefix}:`, error);
  }
};

// Factory tạo cache object cho từng module
type KeyBuilder<P> = (params: P) => string;

export const createCache = <P>(opts: {
  prefix: string;
  buildKey: KeyBuilder<P>;
  ttlSeconds?: number;
}) => {
  const { prefix, buildKey, ttlSeconds = DEFAULT_CACHE_TTL_SECONDS } = opts;

  return {
    get: async <T>(params: P): Promise<T | null> => {
      const key = buildKey(params);
      return getJSONCache<T>(key);
    },

    set: async (params: P, data: unknown): Promise<void> => {
      const key = buildKey(params);
      await setJSONCache(key, data, ttlSeconds);
    },

    clear: async (): Promise<void> => {
      await clearByPrefix(prefix);
    },
  };
};
