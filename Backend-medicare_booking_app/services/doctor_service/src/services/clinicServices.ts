import { CreateClinicProfileData } from "@shared/index";
import { prisma } from "src/config/client";

const VALID_CITIES = ["Hanoi", "HoChiMinh"] as const;

const handleCreateClinicProfile = async (body: CreateClinicProfileData) => {
  const {
    clinic_name,
    city,
    district,
    street,
    phone,
    description,
    icon_path,
    icon_public_id,
  } = body;

  if (
    !clinic_name ||
    !city ||
    !district ||
    !street ||
    !phone ||
    !description ||
    !icon_path ||
    !icon_public_id
  ) {
    throw new Error("Vui lòng nhập đầy đủ thông tin phòng khám");
  }

  if (!VALID_CITIES.includes(city as any)) {
    throw new Error(
      "Thành phố không hợp lệ. Chỉ cho phép HoChiMinh hoặc Hanoi."
    );
  }

  const checkName = await prisma.clinic.findFirst({
    where: {
      clinicName: clinic_name,
    },
  });
  if (checkName) {
    throw new Error("Phòng khám đã tồn tại, vui lòng nhập tên khác");
  }

  const clinic = await prisma.clinic.create({
    data: {
      clinicName: clinic_name,
      city: city as any,
      district,
      street,
      phone,
      description,
      iconPath: icon_path,
      iconPublicId: icon_public_id,
    },
  });
  return clinic;
};

const findClinicById = async (id: string) => {
  const clinic = await prisma.clinic.findUnique({
    where: { id: +id },
  });
  return clinic;
};

const handleGetAllClinics = async (
  page: number,
  pageSize: number,
  city?: string,
  clinicName?: string
) => {
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (city) where.city = city as any;
  if (clinicName) where.clinicName = { contains: clinicName };

  const clinics = await prisma.clinic.findMany({
    where,
    skip: skip,
    take: pageSize,
    orderBy: { id: "asc" },
  });

  return clinics;
};

const countTotalClinicsPage = async (
  pageSize: number,
  city?: string,
  clinicName?: string
) => {
  const where: any = {};
  if (city) where.city = city as any;
  if (clinicName) where.clinicName = { contains: clinicName };

  const totalItems = await prisma.clinic.count({ where });
  const totalPages = Math.ceil(totalItems / pageSize);
  return totalPages;
};

const countClinics = async (city?: string, clinicName?: string) => {
  const where: any = {};
  if (city) where.city = city as any;
  if (clinicName) where.clinicName = { contains: clinicName };
  return prisma.clinic.count({ where });
};

const handleDeleteClinic = async (id: string) => {
  const clinicId = parseInt(id);
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
  });
  if (!clinic) {
    throw new Error("Phòng khám không tồn tại");
  }
  await prisma.clinic.delete({
    where: { id: clinicId },
  });
  return true;
};

const handleUpdateClinic = async (
  id: string,
  body: CreateClinicProfileData
) => {
  const clinicId = parseInt(id);
  const {
    clinic_name,
    city,
    district,
    street,
    phone,
    description,
    icon_path,
    icon_public_id,
  } = body;
  if (
    !clinic_name ||
    !city ||
    !district ||
    !street ||
    !phone ||
    !description ||
    !icon_path ||
    !icon_public_id
  ) {
    throw new Error("Vui lòng nhập đầy đủ thông tin phòng khám");
  }
  if (!VALID_CITIES.includes(city as any)) {
    throw new Error(
      "Thành phố không hợp lệ. Chỉ cho phép HoChiMinh hoặc Hanoi."
    );
  }
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
  });
  if (!clinic) {
    throw new Error("Phòng khám không tồn tại");
  }
  const updatedClinic = await prisma.clinic.update({
    where: { id: clinicId },
    data: {
      clinicName: clinic_name,
      city: city as any,
      district,
      street,
      phone,
      description,
      iconPath: icon_path,
      iconPublicId: icon_public_id,
    },
  });
  return updatedClinic;
};

export {
  handleCreateClinicProfile,
  findClinicById,
  handleGetAllClinics,
  countTotalClinicsPage,
  handleDeleteClinic,
  handleUpdateClinic,
  countClinics,
};
