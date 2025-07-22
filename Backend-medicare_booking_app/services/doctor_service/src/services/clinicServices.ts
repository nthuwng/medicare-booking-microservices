import { CreateClinicProfileData } from "@shared/index";
import { prisma } from "src/config/client";

const VALID_CITIES = ["Hanoi", "HoChiMinh"] as const;

const handleCreateClinicProfile = async (body: CreateClinicProfileData) => {
  const { clinic_name, city, district, street, phone, description } = body;

  if (!clinic_name || !city || !district || !street || !phone || !description) {
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
  city?: string
) => {
  const skip = (page - 1) * pageSize;

  const clinics = await prisma.clinic.findMany({
    where: {
      city: {
        equals: city as any,
      },
    },
    skip: skip,
    take: pageSize,
  });

  return clinics;
};

const countTotalClinicsPage = async (pageSize: number) => {
  const totalItems = await prisma.clinic.count();

  const totalPages = Math.ceil(totalItems / pageSize);

  return totalPages;
};

export {
  handleCreateClinicProfile,
  findClinicById,
  handleGetAllClinics,
  countTotalClinicsPage,
};
