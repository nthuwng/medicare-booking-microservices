import { ApprovalStatus, Gender, Title } from "@prisma/client";
import { DoctorsCache } from "src/cache/doctor/doctor.cache";
import { ApprovedDoctorsCache } from "src/cache/doctor/doctorApprove.cache";
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
      userId: true,
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

const getDoctorProfileFullDetail = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: id },
    include: {
      specialty: true,
      clinic: true,
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

const doctorIdMessage = async (userId: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { userId: userId },
  });
  return doctor;
};

const handleSpecialtyDoctorCheckViaRepository = async (
  specialtyName: string
) => {
  const specialty = await prisma.specialty.findFirst({
    where: { specialtyName: specialtyName },
  });
  if (!specialty) {
    throw new Error("Chuyên khoa không tồn tại");
  }

  const doctor = await prisma.doctor.findMany({
    where: { specialty: { specialtyName: specialtyName } },
    include: {
      specialty: true,
      clinic: true,
    },
  });

  return doctor;
};

const createOneDoctorProfile = async (doctorData: any) => {
  await prisma.doctor.create({
    data: {
      userId: doctorData.userId,
      fullName: doctorData.fullName,
      phone: doctorData.phone,
      bio: doctorData.bio,
      experienceYears: Number(doctorData.experienceYears),
      gender: doctorData.gender as Gender,
      title: doctorData.title as Title,
      specialtyId: Number(doctorData.specialtyId),
      clinicId: Number(doctorData.clinicId),
      bookingFee: Number(doctorData.bookingFee),
      avatarUrl: doctorData.avatarUrl || "",
      avatarPublicId: doctorData.avatarPublicId || "",
      approvalStatus: doctorData.approvalStatus as ApprovalStatus,
    },
    include: {
      specialty: true,
      clinic: true,
    },
  });

  await ApprovedDoctorsCache.clear();
  await DoctorsCache.clear();
};
const importDoctorProfiles = async (doctors: any[]) => {
  // Safety check to ensure doctors is an array
  if (!doctors || !Array.isArray(doctors)) {
    console.error("Invalid doctors data:", doctors);
    throw new Error("doctors parameter must be a valid array");
  }

  for (const doctor of doctors) {
    const existingDoctor = await prisma.doctor.findUnique({
      where: { userId: doctor.userId },
    });
    if (!existingDoctor) {
      await prisma.doctor.create({
        data: {
          userId: doctor.userId,
          fullName: doctor.fullName,
          phone: doctor.phone,
          bio: doctor.bio,
          experienceYears: Number(doctor.experienceYears),
          gender: doctor.gender as Gender,
          title: doctor.title as Title,
          specialtyId: Number(doctor.specialtyId),
          clinicId: Number(doctor.clinicId),
          bookingFee: Number(doctor.bookingFee),
          avatarUrl: doctor.avatarUrl || "",
          avatarPublicId: doctor.avatarPublicId || "",
          approvalStatus: doctor.approvalStatus as ApprovalStatus,
        },
        include: {
          specialty: true,
          clinic: true,
        },
      });
    }
  }

  await ApprovedDoctorsCache.clear();
  await DoctorsCache.clear();

  return {
    success: true,
    message: "Import doctor profiles successfully",
  };
};
export {
  findDoctorByUserId,
  createDoctor,
  findDoctorById,
  getDoctorProfileBasicInfo,
  getUserIdByDoctorId,
  getDoctorProfileFullDetail,
  doctorIdMessage,
  handleSpecialtyDoctorCheckViaRepository,
  importDoctorProfiles,
  createOneDoctorProfile,
};
