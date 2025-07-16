import { ApprovalStatus } from "@prisma/client";
import {
  CreateDoctorProfileData,
  UpdateDoctorStatusInput,
  UserInfo,
} from "@shared/index";
import { prisma } from "src/config/client";
import {
  getAllDoctorsViaRabbitMQ,
  getUserByIdViaRabbitMQ,
} from "src/queue/publishers/doctor.publisher";
import {
  createDoctor,
  findDoctorByUserId,
  findDoctorById,
} from "src/repository/doctor.repo";

const createDoctorProfile = async (
  body: CreateDoctorProfileData,
  userId: string
) => {
  const {
    fullName,
    phone,
    avatar_url,
    clinicId,
    specialtyId,
    bio,
    experienceYears,
    gender,
    title,
    bookingFee,
  } = body;

  // Kiểm tra user có tồn tại trong auth_service
  const userInfo = await checkUserExits(userId);

  // Validate clinic exists
  if (clinicId) {
    const clinic = await prisma.clinic.findUnique({
      where: { id: +clinicId },
    });
    if (!clinic) {
      throw new Error(`Clinic với ID ${clinicId} không tồn tại`);
    }
  }

  // Validate specialty exists
  if (specialtyId) {
    const specialty = await prisma.specialty.findUnique({
      where: { id: +specialtyId },
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
    clinicId,
    specialtyId,
    bio || "",
    experienceYears || 0,
    gender || "",
    title || "",
    bookingFee || 0
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
  clinicId: number,
  specialtyId: number,
  bio: string,
  experienceYears: number,
  gender: string,
  title: string,
  bookingFee: number
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
    clinicId,
    specialtyId,
    bio,
    experienceYears,
    gender,
    title,
    bookingFee
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

const handleGetAllDoctors = async (page: number, pageSize: number) => {
  const skip = (page - 1) * pageSize;
  const doctors = await prisma.doctor.findMany({
    include: {
      clinic: true,
      specialty: true,
    },
    skip: skip,
    take: pageSize,
  });

  const userAllUsers = await getAllDoctorsViaRabbitMQ();

  const doctorsWithUserInfo = doctors.map((doctor) => {
    const userInfo = userAllUsers.find(
      (user: UserInfo) => user.id === doctor.userId
    );
    return { ...doctor, userInfo };
  });

  return {
    doctors: doctorsWithUserInfo,
    totalDoctors: doctorsWithUserInfo.length,
  };
};

const countTotalDoctorPage = async (pageSize: number) => {
  const totalItems = await prisma.doctor.count();

  const totalPages = Math.ceil(totalItems / pageSize);

  return totalPages;
};

const handleGetAllApprovedDoctors = async (page: number, pageSize: number) => {
  const skip = (page - 1) * pageSize;
  const doctors = await prisma.doctor.findMany({
    include: {
      clinic: true,
      specialty: true,
    },
    where: {
      approvalStatus: ApprovalStatus.Approved,
    },
    skip: skip,
    take: pageSize,
  });
  const userAllUsers = await getAllDoctorsViaRabbitMQ();

  if (!userAllUsers || userAllUsers.length === 0) {
    console.warn("Không thể lấy thông tin user từ auth service");
    return {
      doctors: doctors.map((doctor) => ({ ...doctor, userInfo: null })),
      totalDoctors: doctors.length,
      warning: "Không thể lấy thông tin user từ auth service",
    };
  }
  const doctorsWithUserInfo = doctors.map((doctor) => {
    const userInfo = userAllUsers.find(
      (user: UserInfo) => user.id === doctor.userId
    );

    if (!userInfo) {
      console.warn(
        `Không tìm thấy user info cho doctor ${doctor.id} với userId ${doctor.userId}`
      );
    }
    return { ...doctor, userInfo };
  });

  return {
    doctors: doctorsWithUserInfo,
    totalDoctors: doctorsWithUserInfo.length,
  };
};

const checkDoctorInfor = async (doctorId: string) => {
  const doctor = await findDoctorById(doctorId);
  return doctor;
};
export {
  createDoctorProfile,
  getDoctorByIdService,
  updateDoctorStatusService,
  handleGetAllDoctors,
  countTotalDoctorPage,
  handleGetAllApprovedDoctors,
  checkDoctorInfor,
};
