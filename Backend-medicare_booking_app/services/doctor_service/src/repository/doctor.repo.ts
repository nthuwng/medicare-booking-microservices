import { ApprovalStatus, Gender, Title } from "@prisma/client";
import { prisma } from "src/config/client";

const createDoctor = async (
  userId: string,
  fullName: string,
  phone: string,
  avatar_url: string,
  clinicId: number,
  specialtyId: number,
  bio: string,
  experienceYears: number,
  gender: string,
  title: string,
  bookingFee: number,
  avatar_public_id: string
) => {
  return prisma.doctor.create({
    data: {
      userId: userId,
      fullName: fullName,
      phone,
      avatarUrl: avatar_url,
      bio,
      experienceYears: +experienceYears,
      gender: gender as Gender,
      title: title as Title,
      specialtyId: +specialtyId,
      clinicId: +clinicId,
      bookingFee: +bookingFee,
      avatarPublicId: avatar_public_id || "",
    },
    include: {
      specialty: true,
      clinic: true,
    },
  });
};

const findDoctorByUserId = async (userId: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { userId: userId },
    include: {
      specialty: true,
      clinic: true,
    },
  });
  return doctor;
};

const findDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: id },
    include: {
      specialty: true,
      clinic: true,
    },
  });
  return doctor;
};

const getDoctorProfileBasicInfo = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: id },
    select: {
      id: true,
      fullName: true,
      gender: true,
      phone: true,
      experienceYears: true,
      avatarUrl: true,
      title: true,
      approvalStatus: true,
      consultationFee: true,
      bookingFee: true,
      clinicId: true,
      specialtyId: true,
    },
  });
  return doctor;
};

const getUserIdByDoctorId = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: id },
    select: {
      userId: true,
    },
  });
  return doctor;
};

export {
  findDoctorByUserId,
  createDoctor,
  findDoctorById,
  getDoctorProfileBasicInfo,
  getUserIdByDoctorId,
};
