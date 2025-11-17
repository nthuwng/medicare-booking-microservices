// src/cache/specialities/specialities.cache.ts
import { createCache } from "src/cache/base.cache";

export const ALL_SPECIALITIES_PREFIX = "specialities:all";

export type AllSpecialitiesCacheParams = {
  page: number;
  pageSize: number;
  specialtyName?: string;
};

const buildCacheKey = (params: AllSpecialitiesCacheParams): string => {
  const { page, pageSize, specialtyName } = params;

  return [
    ALL_SPECIALITIES_PREFIX,
    page,
    pageSize,
    specialtyName || "_",
  ].join(":");
};

export const AllSpecialitiesCache = createCache<AllSpecialitiesCacheParams>({
  prefix: ALL_SPECIALITIES_PREFIX,
  buildKey: buildCacheKey,
  ttlSeconds: 600,
});
