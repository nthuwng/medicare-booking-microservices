import { CreateSpecialtiesProfileData } from "@shared/interfaces/specialties/ISpecialties";
import { prisma } from "src/config/client";

const handleCreateSpecialtiesProfile = async (
  body: CreateSpecialtiesProfileData
) => {
  const { specialty_name, description, icon_path } = body;
  if (!specialty_name || !description || !icon_path) {
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
    },
  });
  return specialties;
};

export { handleCreateSpecialtiesProfile };
