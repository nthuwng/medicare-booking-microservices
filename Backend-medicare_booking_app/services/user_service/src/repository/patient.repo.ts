import { prisma } from "src/config/client";

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

const getAllPatient = async () => {
  const patients = await prisma.patient.findMany();
  return patients;
};

const deletePatient = async (id: string) => {
  const patient = await prisma.patient.delete({
    where: { id: id },
  });
  return patient;
};

export {
  findPatientByUserId,
  createPatient,
  getUserIdByPatientId,
  getPatientById,
  getAllPatient,
  deletePatient
};
