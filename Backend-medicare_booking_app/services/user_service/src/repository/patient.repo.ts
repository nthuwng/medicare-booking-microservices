import { Gender } from "@shared/interfaces/common/enums";
import { prisma } from "src/config/client";
import { checkUserExits } from "src/services/patient.service";

const createPatient = async (
  userId: string,
  fullName: string,
  phone: string,
  avatarUrl: string,
  gender: "Male" | "Female" | "Other",
  dateOfBirth: Date,
  address: string,
  city: string,
  district: string
) => {
  const patient = await prisma.patient.create({
    data: {
      user_id: userId,
      full_name: fullName,
      phone,
      avatar_url: avatarUrl,
      gender,
      date_of_birth: dateOfBirth,
      address,
      city,
      district,
    },
  });

  return patient;
};

const usernameFromEmail = (email: string) => {
  const local = email.trim().toLowerCase().split("@")[0];
  // Bỏ phần +tag của Gmail: user+abc@gmail.com -> user
  const noPlus = local.replace(/\+.*$/, "");
  // Giữ ký tự an toàn
  const safe = noPlus.replace(/[^a-z0-9._-]/g, "");
  return safe.slice(0, 30); // giới hạn chiều dài nếu muốn
};

const createUserProfile = async (userId: string, email: string) => {
  try {
    // Kiểm tra user đã có profile chưa
    const existingProfile = await findPatientByUserId(userId);
    if (existingProfile) {
      return existingProfile;
    }

    const username = usernameFromEmail(email); // ví dụ: 'luluvogmot23'

    // Tạo profile cơ bản với default values
    const userProfile = await prisma.patient.create({
      data: {
        user_id: userId,
        full_name: username, // Default name, user có thể update sau
        phone: "", // Empty, user sẽ cập nhật sau
        gender: "Other", // Default gender
        avatar_url: "",
        address: "",
        city: "",
        district: "",
        date_of_birth: null,
      },
    });
    return userProfile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

const findPatientByUserId = async (userId: string) => {
  const admin = await prisma.patient.findUnique({
    where: { user_id: userId },
  });
  return admin;
};

const getPatientById = async (id: string) => {
  const patient = await prisma.patient.findUnique({
    where: { id: id },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  return patient;
};

const getUserIdByPatientId = async (id: string) => {
  const userId = await prisma.patient.findUnique({
    where: { id: id },
    select: {
      user_id: true,
    },
  });

  if (!userId) {
    throw new Error("User ID not found");
  }

  return userId;
};

const getAllPatient = async (
  skip: number,
  pageSize: number,
  fullName: string,
  phone: string
) => {
  const patients = await prisma.patient.findMany({
    where: {
      AND: [
        {
          full_name: { contains: fullName },
        },
        {
          phone: { contains: phone },
        },
      ],
    },
    skip,
    take: pageSize,
  });
  return patients;
};
const deletePatient = async (id: string) => {
  const patient = await prisma.patient.delete({
    where: { id: id },
  });
  return patient;
};

const getPatientIdByUserId = async (userId: string) => {
  const patient = await prisma.patient.findUnique({
    where: { user_id: userId },
  });
  return patient;
};

const getUserProfileByUserId = async (userId: string) => {
  const userProfile = await prisma.patient.findUnique({
    where: { user_id: userId },
  });
  return userProfile;
};

const createOnePatientProfile = async (patients: any) => {
  await prisma.patient.create({
    data: {
      user_id: patients.userId,
      full_name: patients.fullName,
      phone: patients.phone,
      avatar_url: patients.avatarUrl || "",
    },
  });
};

export {
  createOnePatientProfile,
  getUserProfileByUserId,
  findPatientByUserId,
  createPatient,
  getUserIdByPatientId,
  getPatientById,
  getAllPatient,
  deletePatient,
  createUserProfile,
  getPatientIdByUserId,
};
