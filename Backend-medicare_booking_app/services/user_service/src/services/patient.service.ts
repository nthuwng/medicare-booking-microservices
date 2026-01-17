import {
  createPatient,
  deletePatient,
  findPatientByUserId,
  getAllPatient,
  getPatientById,
  getUserIdByPatientId,
} from "src/repository/patient.repo";
import { CreatePatientProfileData, UserInfo } from "../../shared/index";
import {
  getAllUserViaRabbitMQ,
  getUserByIdViaRabbitMQ,
} from "src/queue/publishers/user.publisher";
import { prisma } from "src/config/client";

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
    fullName || "",
    phone || "",
    avatarUrl || "",
    gender || "",
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

const countTotalPatient = async () => {
  const totalItems = await prisma.patient.count();
  return totalItems;
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

const countTotalPatientPage = async (pageSize: number) => {
  const totalItems = await prisma.patient.count();

  const totalPages = Math.ceil(totalItems / pageSize);

  return totalPages;
};

const getAllPatientService = async (
  page: number,
  pageSize: number,
  fullName: string,
  phone: string
) => {
  const skip = (page - 1) * pageSize;
  const patients = await getAllPatient(skip, pageSize, fullName, phone);

  const userAllUsers = await getAllUserViaRabbitMQ();

  const patientsWithUserInfo = patients.map((patient) => {
    const userInfo = userAllUsers.find(
      (user: UserInfo) => user.id === patient.user_id
    );
    return { ...patient, userInfo };
  });

  return {
    patients: patientsWithUserInfo,
    totalPatients: patientsWithUserInfo.length,
  };
};

const deletePatientService = async (id: string) => {
  const patient = await deletePatient(id);
  return patient;
};

const getPatientByUserId = async (userId: string) => {
  const userInfo = await getUserByIdViaRabbitMQ(userId);
  if (!userInfo) {
    throw new Error("User not found");
  }

  const patient = await prisma.patient.findUnique({
    where: { user_id: userId },
  });
  return {
    ...patient,
    userInfo,
  };
};

const updatePatientProfile = async (
  id: string,
  fullName: string,
  phone: string,
  dateOfBirth: Date,
  gender: "Male" | "Female" | "Other",
  address: string,
  city: string,
  district: string,
  avatarUrl: string
) => {
  const patient = await prisma.patient.update({
    where: { id },
    data: {
      full_name: fullName,
      phone,
      date_of_birth: new Date(dateOfBirth),
      gender,
      address,
      city,
      district,
      avatar_url: avatarUrl,
    },
  });
  return patient;
};

const deletePatientAvatarService = async (id: string) => {
  const patient = await prisma.patient.update({
    where: { id },
    data: {
      avatar_url: "",
    },
  });
  return patient;
};

export {
  createPatientProfile,
  checkTypeAndCreatePatientProfile,
  checkUserExits,
  countTotalPatient,
  deletePatientAvatarService,
  getPatientByIdService,
  getAllPatientService,
  countTotalPatientPage,
  deletePatientService,
  getPatientByUserId,
  updatePatientProfile,
};
