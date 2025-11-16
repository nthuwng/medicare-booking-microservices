import { redis } from "src/config/redis";


const CACHE_TTL_SECONDS = 10; // 10 phút
const APPROVED_DOCTORS_PREFIX = "approved_doctors";

export type ApprovedDoctorsCacheParams = {
  page: number;
  pageSize: number;
  fullName: string;
  phone: string;
  title: string;
  specialtyId?: string;
  clinicId?: string;
};

const buildCacheKey = (params: ApprovedDoctorsCacheParams): string => {
  const { page, pageSize, fullName, phone, title, specialtyId, clinicId } =
    params;

  return [
    APPROVED_DOCTORS_PREFIX,
    page,
    pageSize,
    fullName || "_",
    phone || "_",
    title || "_",
    specialtyId || "_",
    clinicId || "_",
  ].join(":");
};

/**
 * Lấy dữ liệu từ cache
 */
const getCache = async <T>(
  params: ApprovedDoctorsCacheParams
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
  params: ApprovedDoctorsCacheParams,
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
 * Xóa tất cả cache approved doctors
 */
const clearAllCache = async (): Promise<void> => {
  try {
    const pattern = `${APPROVED_DOCTORS_PREFIX}:*`;
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
export const ApprovedDoctorsCache = {
  get: getCache,
  set: setCache,
  clear: clearAllCache,
};
