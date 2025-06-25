import { CreateClinicProfileData } from "@shared/index";
import { prisma } from "src/config/client";

const handleCreateClinicProfile = async (body: CreateClinicProfileData) => {
  const { clinic_name, city, district, street, phone, description } = body;
  if (!clinic_name || !city || !district || !street || !phone || !description) {
    throw new Error("Vui lòng nhập đầy đủ thông tin phòng khám");
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
      city,
      district,
      street,
      phone,
      description,
    },
  });
  return clinic;
};

export { handleCreateClinicProfile };
