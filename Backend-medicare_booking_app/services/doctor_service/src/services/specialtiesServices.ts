import { CreateSpecialtiesProfileData } from "@shared/interfaces/specialties/ISpecialties";
import {
  AllSpecialitiesCache,
  AllSpecialitiesCacheParams,
} from "src/cache/specialities/specialities.cache";
import { prisma } from "src/config/client";

const handleCreateSpecialtiesProfile = async (
  body: CreateSpecialtiesProfileData
) => {
  const { specialty_name, description, icon_path, icon_public_id } = body;
  if (!specialty_name || !description || !icon_path || !icon_public_id) {
    throw new Error("Vui lòng nhập đầy đủ thông tin chuyên khoa");
  }

  const checkName = await prisma.specialty.findFirst({
    where: {
      specialtyName: specialty_name,
    },
  });
  if (checkName) {
    throw new Error("Tên chuyên khoa đã tồn tại, vui lòng nhập tên khác");
  }

  const specialties = await prisma.specialty.create({
    data: {
      specialtyName: specialty_name,
      description,
      iconPath: icon_path,
      iconPublicId: icon_public_id,
    },
  });
  return specialties;
};

const handleGetAllSpecialties = async (
  page: number,
  pageSize: number,
  specialtyName?: string
) => {
  const cacheParams: AllSpecialitiesCacheParams = {
    page,
    pageSize,
    specialtyName,
  };
  const cachedSpecialties = await AllSpecialitiesCache.get<any[]>(cacheParams);
  if (cachedSpecialties) {
    console.log("✅ Specialities fetched from cache");
    return cachedSpecialties;
  }

  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (specialtyName) where.specialtyName = { contains: specialtyName };

  const specialties = await prisma.specialty.findMany({
    where,
    skip: skip,
    take: pageSize,
    orderBy: { id: "asc" },
  });
  await AllSpecialitiesCache.set(cacheParams, specialties);
  return specialties;
};

const countTotalSpecialtiesPage = async (
  pageSize: number,
  specialtyName?: string
) => {
  const where: any = {};
  if (specialtyName) where.specialtyName = { contains: specialtyName };
  const totalItems = await prisma.specialty.count({ where });
  const totalPages = Math.ceil(totalItems / pageSize);
  return totalPages;
};

const countSpecialties = async (specialtyName?: string) => {
  const where: any = {};
  if (specialtyName) where.specialtyName = { contains: specialtyName };
  return prisma.specialty.count({ where });
};

const handleDeleteSpecialty = async (id: string) => {
  const specialtyId = parseInt(id);
  const specialty = await prisma.specialty.findUnique({
    where: { id: specialtyId },
  });
  if (!specialty) {
    throw new Error(" Chuyên khoa không tồn tại");
  }
  await prisma.specialty.delete({
    where: { id: specialtyId },
  });
  return true;
};

const handleUpdateSpecialty = async (
  id: string,
  body: CreateSpecialtiesProfileData
) => {
  const specialtyId = parseInt(id);
  const { specialty_name, description, icon_path, icon_public_id } = body;
  const specialty = await prisma.specialty.findUnique({
    where: { id: specialtyId },
  });
  if (!specialty) {
    throw new Error(" Chuyên khoa không tồn tại");
  }

  const updatedSpecialty = await prisma.specialty.update({
    where: { id: specialtyId },
    data: {
      specialtyName: specialty_name,
      description,
      iconPath: icon_path,
      iconPublicId: icon_public_id,
    },
  });
  return updatedSpecialty;
};

export {
  handleCreateSpecialtiesProfile,
  handleGetAllSpecialties,
  countTotalSpecialtiesPage,
  handleDeleteSpecialty,
  handleUpdateSpecialty,
  countSpecialties,
};
