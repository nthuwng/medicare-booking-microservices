// src/cache/doctor/doctorApprove.cache.ts
import { createCache } from "src/cache/base.cache";

export const APPROVED_DOCTORS_PREFIX = "approved_doctors";

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

export const ApprovedDoctorsCache = createCache<ApprovedDoctorsCacheParams>({
  prefix: APPROVED_DOCTORS_PREFIX,
  buildKey: buildCacheKey,
  ttlSeconds: 600,
});
