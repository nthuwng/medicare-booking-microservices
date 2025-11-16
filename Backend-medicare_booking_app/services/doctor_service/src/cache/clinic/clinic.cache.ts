import { redis } from "src/config/redis";

// ====================================
// CONSTANTS
// ====================================
const CACHE_TTL_SECONDS = 10; // 10 phút
const ALL_CLINICS_PREFIX = "clinics:all";

// ====================================
// TYPES
// ====================================
export type AllClinicsCacheParams = {
  page: number;
  pageSize: number;
  city?: string;
  clinicName?: string;
};

// ====================================
// CACHE KEY BUILDER
// ====================================
const buildCacheKey = (params: AllClinicsCacheParams): string => {
  const { page, pageSize, city, clinicName } = params;

  return [
    ALL_CLINICS_PREFIX,
    page,
    pageSize,
    city || "_",
    clinicName || "_",
  ].join(":");
};

/**
 * Lấy dữ liệu từ cache
 */
const getCache = async <T>(
  params: AllClinicsCacheParams
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
  params: AllClinicsCacheParams,
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
    const pattern = `${ALL_CLINICS_PREFIX}:*`;
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
export const AllClinicsCache = {
  get: getCache,
  set: setCache,
  clear: clearAllCache,
};
