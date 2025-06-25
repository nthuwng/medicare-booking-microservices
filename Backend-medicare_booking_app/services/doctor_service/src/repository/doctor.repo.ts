import { ApprovalStatus, Gender } from "@prisma/client";
import { prisma } from "src/config/client";

const createDoctor = async (
  userId: string,
  fullName: string,
  phone: string,
  avatar_url: string,
  clinic_id: number,
  specialty_id: number,
  bio: string,
  experience_years: number,
  gender: string,
  license_number: string
) => {
  return prisma.doctor.create({
    data: {
      userId: userId,
      fullName: fullName,
      phone,
      avatarUrl: avatar_url,
      clinicId: +clinic_id,
      specialtyId: +specialty_id,
      bio,
      experienceYears: +experience_years,
      gender: gender as Gender,
      licenseNumber: license_number,
    },
  });
};

const findDoctorByUserId = async (userId: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { userId: userId },
  });
  return doctor;
};

export { findDoctorByUserId, createDoctor };
