import { ApprovalStatus } from "@prisma/client";
import {
  CreateDoctorProfileData,
  UpdateDoctorStatusInput,
  UserInfo,
  AddDoctorSpecialtyData,
  AddDoctorClinicData,
  RemoveDoctorSpecialtyData,
  RemoveDoctorClinicData,
} from "@shared/index";
import { prisma } from "src/config/client";
import { getUserByIdViaRabbitMQ } from "src/queue/publishers/doctor.publisher";
import {
  createDoctor,
  findDoctorByUserId,
  findDoctorById,
  addDoctorSpecialty,
  removeDoctorSpecialty,
  addDoctorClinic,
  removeDoctorClinic,
  getDoctorsBySpecialty,
  getDoctorsByClinic,
} from "src/repository/doctor.repo";

const createDoctorProfile = async (
  body: CreateDoctorProfileData,
  userId: string
) => {
  const {
    fullName,
    phone,
    avatar_url,
    clinic_ids,
    specialty_ids,
    bio,
    experience_years,
    gender,
    license_number,
  } = body;

  // Parse clinic_ids and specialty_ids if they come as strings
  const parsedClinicIds: number[] = Array.isArray(clinic_ids)
    ? clinic_ids
    : String(clinic_ids)
        .split(",")
        .map((id: string) => parseInt(id.trim()));

  const parsedSpecialtyIds: number[] = Array.isArray(specialty_ids)
    ? specialty_ids
    : String(specialty_ids)
        .split(",")
        .map((id: string) => parseInt(id.trim()));

  // Kiểm tra user có tồn tại trong auth_service
  const userInfo = await checkUserExits(userId);

  // Validate clinics exist
  for (const clinicId of parsedClinicIds) {
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });
    if (!clinic) {
      throw new Error(`Clinic với ID ${clinicId} không tồn tại`);
    }
  }

  // Validate specialties exist
  for (const specialtyId of parsedSpecialtyIds) {
    const specialty = await prisma.specialty.findUnique({
      where: { id: specialtyId },
    });
    if (!specialty) {
      throw new Error(`Specialty với ID ${specialtyId} không tồn tại`);
    }
  }

  const doctor = await checkTypeAndCreateDoctorProfile(
    userId,
    fullName,
    phone,
    avatar_url || "",
    parsedClinicIds,
    parsedSpecialtyIds,
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

  // Kiểm tra xem doctor profile đã tồn tại chưa
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
  clinic_ids: number[],
  specialty_ids: number[],
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
    clinic_ids,
    specialty_ids,
    bio,
    experience_years,
    gender,
    license_number
  );
  return doctor;
};

const getDoctorByIdService = async (id: string) => {
  // Lấy doctor từ database với relations
  const doctor = await findDoctorById(id);

  if (!doctor) {
    throw new Error("Doctor không tồn tại");
  }

  // Gọi sang auth_service để lấy thông tin user
  const userInfo = await getUserByIdViaRabbitMQ(doctor.userId);

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

  const doctor = await findDoctorById(id);

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

// New services for managing doctor-specialty relationships
const addDoctorSpecialtyService = async (data: AddDoctorSpecialtyData) => {
  const { doctorId, specialtyId } = data;

  // Check if doctor exists
  const doctor = await findDoctorById(doctorId);
  if (!doctor) {
    throw new Error("Doctor không tồn tại");
  }

  // Check if specialty exists
  const specialty = await prisma.specialty.findUnique({
    where: { id: specialtyId },
  });
  if (!specialty) {
    throw new Error("Specialty không tồn tại");
  }

  // Check if relationship already exists
  const existingRelation = await prisma.doctorSpecialty.findUnique({
    where: {
      doctorId_specialtyId: {
        doctorId,
        specialtyId,
      },
    },
  });

  if (existingRelation) {
    throw new Error("Doctor đã có specialty này rồi");
  }

  return await addDoctorSpecialty(doctorId, specialtyId);
};

const removeDoctorSpecialtyService = async (
  data: RemoveDoctorSpecialtyData
) => {
  const { doctorId, specialtyId } = data;

  // Check if relationship exists
  const existingRelation = await prisma.doctorSpecialty.findUnique({
    where: {
      doctorId_specialtyId: {
        doctorId,
        specialtyId,
      },
    },
  });

  if (!existingRelation) {
    throw new Error("Doctor không có specialty này");
  }

  return await removeDoctorSpecialty(doctorId, specialtyId);
};

// New services for managing doctor-clinic relationships
const addDoctorClinicService = async (data: AddDoctorClinicData) => {
  const { doctorId, clinicId } = data;

  // Check if doctor exists
  const doctor = await findDoctorById(doctorId);
  if (!doctor) {
    throw new Error("Doctor không tồn tại");
  }

  // Check if clinic exists
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
  });
  if (!clinic) {
    throw new Error("Clinic không tồn tại");
  }

  // Check if relationship already exists
  const existingRelation = await prisma.doctorClinic.findUnique({
    where: {
      doctorId_clinicId: {
        doctorId,
        clinicId,
      },
    },
  });

  if (existingRelation) {
    throw new Error("Doctor đã thuộc clinic này rồi");
  }

  return await addDoctorClinic(doctorId, clinicId);
};

const removeDoctorClinicService = async (data: RemoveDoctorClinicData) => {
  const { doctorId, clinicId } = data;

  // Check if relationship exists
  const existingRelation = await prisma.doctorClinic.findUnique({
    where: {
      doctorId_clinicId: {
        doctorId,
        clinicId,
      },
    },
  });

  if (!existingRelation) {
    throw new Error("Doctor không thuộc clinic này");
  }

  return await removeDoctorClinic(doctorId, clinicId);
};

// Service to get doctors by specialty
const getDoctorsBySpecialtyService = async (specialtyId: number) => {
  const specialty = await prisma.specialty.findUnique({
    where: { id: specialtyId },
  });

  if (!specialty) {
    throw new Error("Specialty không tồn tại");
  }

  return await getDoctorsBySpecialty(specialtyId);
};

// Service to get doctors by clinic
const getDoctorsByClinicService = async (clinicId: number) => {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
  });

  if (!clinic) {
    throw new Error("Clinic không tồn tại");
  }

  return await getDoctorsByClinic(clinicId);
};

export {
  createDoctorProfile,
  getDoctorByIdService,
  updateDoctorStatusService,
  addDoctorSpecialtyService,
  removeDoctorSpecialtyService,
  addDoctorClinicService,
  removeDoctorClinicService,
  getDoctorsBySpecialtyService,
  getDoctorsByClinicService,
};
