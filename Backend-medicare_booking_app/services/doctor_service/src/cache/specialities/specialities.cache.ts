import { redis } from "src/config/redis";

// ====================================
// CONSTANTS
// ====================================
const CACHE_TTL_SECONDS = 10; // 10 phút
const ALL_SPECIALITIES_PREFIX = "specialities:all";

// ====================================
// TYPES
// ====================================
export type AllSpecialitiesCacheParams = {
  page: number;
  pageSize: number;
  specialtyName?: string;
};

// ====================================
// CACHE KEY BUILDER
// ====================================
const buildCacheKey = (params: AllSpecialitiesCacheParams): string => {
  const { page, pageSize, specialtyName } = params;

  return [
    ALL_SPECIALITIES_PREFIX,
    page,
    pageSize,
    specialtyName || "_",
  ].join(":");
};

/**
 * Lấy dữ liệu từ cache
 */
const getCache = async <T>(
  params: AllSpecialitiesCacheParams
): Promise<T | null> => {
  const key = buildCacheKey(params);

  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (error) {
    console.error(`[Redis] Error getting cache for ${key}:`, error);
    return null;
  }
};

/**
 * Lưu dữ liệu vào cache
 */
const setCache = async (
  params: AllSpecialitiesCacheParams,
  data: unknown
): Promise<void> => {
  const key = buildCacheKey(params);

  try {
    await redis.set(key, JSON.stringify(data), "EX", CACHE_TTL_SECONDS);
  } catch (error) {
    console.error(`[Redis] Error setting cache for ${key}:`, error);
  }
};

/**
 * Xóa tất cả cache clinics
 */
const clearAllCache = async (): Promise<void> => {
  try {
    const pattern = `${ALL_SPECIALITIES_PREFIX}:*`;
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("[Redis] Error clearing cache:", error);
  }
};

// ====================================
// EXPORTS
// ====================================
export const AllSpecialitiesCache = {
  get: getCache,
  set: setCache,
  clear: clearAllCache,
};
