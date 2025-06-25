import { ApprovalStatus } from "@prisma/client";
import {
  CreateDoctorProfileData,
  UpdateDoctorStatusInput,
  UserInfo,
} from "@shared/index";
import { prisma } from "src/config/client";
import { getUserByIdViaRabbitMQ } from "src/queue/publishers/doctor.publisher";
import { createDoctor, findDoctorByUserId } from "src/repository/doctor.repo";

const createDoctorProfile = async (
  body: CreateDoctorProfileData,
  userId: string
) => {
  const {
    fullName,
    phone,
    avatar_url,
    clinic_id,
    specialty_id,
    bio,
    experience_years,
    gender,
    license_number,
  } = body;

  //Kiểm tra user có tồn tại trong auth_service
  const userInfo = await checkUserExits(userId);

  const clinic = await prisma.clinic.findUnique({
    where: { id: +clinic_id },
  });

  if (!clinic) {
    throw new Error("Clinic không tồn tại");
  }

  const specialty = await prisma.specialty.findUnique({
    where: { id: +specialty_id },
  });

  if (!specialty) {
    throw new Error("Specialty không tồn tại");
  }

  const doctor = await checkTypeAndCreateDoctorProfile(
    userId,
    fullName,
    phone,
    avatar_url || "",
    clinic_id,
    specialty_id,
    bio || "",
    experience_years || 0,
    gender || "",
    license_number || ""
  );

  return {
    ...doctor,
    userInfo,
  };
};

const checkUserExits = async (userId: string) => {
  const userExits = (await getUserByIdViaRabbitMQ(userId)) as UserInfo;

  if (!userExits || !userExits.userType) {
    throw new Error("User không tồn tại trong auth_service");
  }

  // Kiểm tra xem admin profile đã tồn tại chưa
  const existingDoctor = await findDoctorByUserId(userId);

  if (existingDoctor) {
    throw new Error("Doctor profile đã tồn tại cho user này");
  }

  return userExits;
};

const checkTypeAndCreateDoctorProfile = async (
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
  const userType = (await getUserByIdViaRabbitMQ(userId)) as UserInfo;

  if (userType.userType !== "DOCTOR") {
    throw new Error("User này không phải là DOCTOR");
  }
  const doctor = await createDoctor(
    userId,
    fullName,
    phone,
    avatar_url || "",
    clinic_id,
    specialty_id,
    bio,
    experience_years,
    gender,
    license_number
  );
  return doctor;
};

const getDoctorByIdService = async (id: string) => {
  //Lấy admin từ database
  const doctor = await prisma.doctor.findUnique({
    where: { id: id },
    include: {
      clinic: true,
      specialty: true,
    },
  });

  console.log("doctor", doctor);

  //Lấy user_id từ admin
  const userId = await prisma.doctor.findUnique({
    where: { id: id },
    select: {
      userId: true,
    },
  });

  if (!userId?.userId) {
    throw new Error("User ID not found");
  }

  //Gọi sang auth_service để lấy thông tin user
  const userInfo = await getUserByIdViaRabbitMQ(userId.userId);

  return {
    ...doctor,
    userInfo,
  };
};

const updateDoctorStatusService = async (
  id: string,
  body: UpdateDoctorStatusInput
) => {
  const { status } = body;

  if (!Object.values(ApprovalStatus).includes(status as ApprovalStatus)) {
    throw new Error("Trạng thái không hợp lệ");
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: id },
  });

  if (!doctor?.userId) {
    throw new Error("Doctor không tồn tại");
  }

  const userExists = (await getUserByIdViaRabbitMQ(doctor?.userId)) as UserInfo;

  if (!userExists || !userExists.userType) {
    throw new Error("User không tồn tại trong auth_service");
  }

  const doctorUpdated = await prisma.doctor.update({
    where: { id: id },
    data: { approvalStatus: status as ApprovalStatus },
  });
  return doctorUpdated;
};

export { createDoctorProfile, getDoctorByIdService, updateDoctorStatusService };
