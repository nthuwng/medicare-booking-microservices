// src/cache/clinic/clinic.cache.ts
import { createCache } from "src/cache/base.cache";

export const ALL_CLINICS_PREFIX = "clinics:all";

export type AllClinicsCacheParams = {
  page: number;
  pageSize: number;
  city?: string;
  clinicName?: string;
};

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

export const AllClinicsCache = createCache<AllClinicsCacheParams>({
  prefix: ALL_CLINICS_PREFIX,
  buildKey: buildCacheKey,
  ttlSeconds: 600, // có thể bỏ, mặc định 600
});
