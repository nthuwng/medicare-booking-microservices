import {
  createPatient,
  deletePatient,
  findPatientByUserId,
  getAllPatient,
  getPatientById,
  getUserIdByPatientId,
} from "src/repository/patient.repo";
import { CreatePatientProfileData, UserInfo } from "@shared/index";
import { getUserByIdViaRabbitMQ } from "src/queue/publishers/user.publisher";

const createPatientProfile = async (
  body: CreatePatientProfileData,
  userId: string
) => {
  const {
    fullName,
    phone,
    avatarUrl,
    gender,
    dateOfBirth,
    address,
    city,
    district,
  } = body;

  //Kiểm tra user có tồn tại trong auth_service
  const userInfo = await checkUserExits(userId);

  const patient = await checkTypeAndCreatePatientProfile(
    userId,
    fullName,
    phone,
    avatarUrl || "",
    gender,
    dateOfBirth ? new Date(dateOfBirth) : new Date(),
    address || "",
    city || "",
    district || ""
  );

  return {
    ...patient,
    userInfo,
  };
};

const checkUserExits = async (userId: string) => {
  const userExits = (await getUserByIdViaRabbitMQ(userId)) as UserInfo;

  if (!userExits || !userExits.userType) {
    throw new Error("User không tồn tại trong auth_service");
  }

  // Kiểm tra xem admin profile đã tồn tại chưa
  const existingAdmin = await findPatientByUserId(userId);

  if (existingAdmin) {
    throw new Error("Patient profile đã tồn tại cho user này");
  }

  return userExits;
};

const checkTypeAndCreatePatientProfile = async (
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
  const userType = (await getUserByIdViaRabbitMQ(userId)) as UserInfo;

  if (userType.userType !== "PATIENT") {
    throw new Error("User này không phải là PATIENT");
  }
  const patient = await createPatient(
    userId,
    fullName,
    phone,
    avatarUrl,
    gender,
    dateOfBirth,
    address,
    city,
    district
  );
  return patient;
};

const getPatientByIdService = async (id: string) => {
  //Lấy patient từ database
  const patient = await getPatientById(id);

  //Lấy user_id từ patient
  const userId = await getUserIdByPatientId(id);

  if (!userId?.user_id) {
    throw new Error("User ID not found");
  }

  //Gọi sang auth_service để lấy thông tin user
  const userInfo = await getUserByIdViaRabbitMQ(userId.user_id);

  return {
    ...patient,
    userInfo,
  };
};

const getAllPatientService = async () => {
  const patients = await getAllPatient();
  return patients;
};

const deletePatientService = async (id: string) => {
  const patient = await deletePatient(id);
  return patient;
};

export {
  createPatientProfile,
  checkTypeAndCreatePatientProfile,
  checkUserExits,
  getPatientByIdService,
  getAllPatientService,
  deletePatientService
};
