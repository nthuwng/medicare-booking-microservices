import { ApprovalStatus, Title } from "@prisma/client";
import {
  CreateDoctorProfileData,
  UpdateDoctorStatusInput,
  UserInfo,
} from "@shared/index";
import { prisma } from "src/config/client";
import {
  getAllDoctorsViaRabbitMQ,
  getUserByIdViaRabbitMQ,
  sendMessageRegisterDoctorViaRabbitMQ,
  sendMessageUpdateDoctorStatusViaRabbitMQ,
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

  try {
    await sendMessageRegisterDoctorViaRabbitMQ(
      userId,
      doctor.approvalStatus,
      avatar_url || "",
      doctor.id,
      fullName,
      phone
    );
  } catch (publishError) {
    console.error(
      `[Doctor Service] Failed to publish new doctor registration for ${fullName}:`,
      publishError
    );
  }

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

const updateDoctorStatusService = async (id: string) => {
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
    data: { approvalStatus: ApprovalStatus.Approved },
  });

  try {
    await sendMessageUpdateDoctorStatusViaRabbitMQ(
      doctorUpdated.userId,
      doctorUpdated.approvalStatus,
      doctorUpdated.avatarUrl || "",
      doctorUpdated.id,
      doctorUpdated.fullName,
      doctorUpdated.phone || ""
    );
  } catch (publishError) {
    console.error(
      `[Doctor Service] Failed to publish new doctor updated for ${doctorUpdated.fullName}:`,
      publishError
    );
  }

  return doctorUpdated;
};

const handleGetAllDoctors = async (
  page: number,
  pageSize: number,
  fullName: string,
  phone: string,
  title: string
) => {
  const skip = (page - 1) * pageSize;

  // Build where conditions
  const whereConditions: any[] = [];

  if (fullName && fullName.trim() !== "") {
    whereConditions.push({
      fullName: { contains: fullName },
    });
  }

  if (phone && phone.trim() !== "") {
    whereConditions.push({
      phone: { contains: phone },
    });
  }

  if (title && title.trim() !== "") {
    // Map Vietnamese titles to enum values
    const titleMapping: { [key: string]: string } = {
      "bác sĩ": "BS",
      "bac si": "BS",
      "thạc sĩ": "ThS",
      "thac si": "ThS",
      "tiến sĩ": "TS",
      "tien si": "TS",
      "phó giáo sư": "PGS",
      "pho giao su": "PGS",
      "giáo sư": "GS",
      "giao su": "GS",
    };

    let searchTitle = title.trim();

    // Check if it's a Vietnamese title
    if (titleMapping[searchTitle.toLowerCase()]) {
      searchTitle = titleMapping[searchTitle.toLowerCase()];
    }

    // Validate title enum values
    const validTitles = ["BS", "ThS", "TS", "PGS", "GS"];
    if (!validTitles.includes(searchTitle)) {
      throw new Error(
        `Chức vụ "${title}" không hợp lệ. Các giá trị hợp lệ: Bác sĩ, Thạc sĩ, Tiến sĩ, Phó Giáo sư, Giáo sư hoặc BS, ThS, TS, PGS, GS`
      );
    }

    whereConditions.push({
      title: { equals: searchTitle as Title },
    });
  }

  const doctors = await prisma.doctor.findMany({
    include: {
      clinic: true,
      specialty: true,
    },
    where: whereConditions.length > 0 ? { AND: whereConditions } : {},
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

const handleGetAllApprovedDoctors = async (
  page: number,
  pageSize: number,
  fullName: string,
  phone: string,
  title: string,
  specialtyId?: string,
  clinicId?: string
) => {
  const skip = (page - 1) * pageSize;

  // Build where conditions
  const whereConditions: any[] = [];

  if (fullName && fullName.trim() !== "") {
    whereConditions.push({
      fullName: { contains: fullName },
    });
  }

  if (phone && phone.trim() !== "") {
    whereConditions.push({
      phone: { contains: phone },
    });
  }

  if (title && title.trim() !== "") {
    // Map Vietnamese titles to enum values
    const titleMapping: { [key: string]: string } = {
      "bác sĩ": "BS",
      "bac si": "BS",
      "thạc sĩ": "ThS",
      "thac si": "ThS",
      "tiến sĩ": "TS",
      "tien si": "TS",
      "phó giáo sư": "PGS",
      "pho giao su": "PGS",
      "giáo sư": "GS",
      "giao su": "GS",
    };

    let searchTitle = title.trim();

    // Check if it's a Vietnamese title
    if (titleMapping[searchTitle.toLowerCase()]) {
      searchTitle = titleMapping[searchTitle.toLowerCase()];
    }

    // Validate title enum values
    const validTitles = ["BS", "ThS", "TS", "PGS", "GS"];
    if (!validTitles.includes(searchTitle)) {
      throw new Error(
        `Chức vụ "${title}" không hợp lệ. Các giá trị hợp lệ: Bác sĩ, Thạc sĩ, Tiến sĩ, Phó Giáo sư, Giáo sư hoặc BS, ThS, TS, PGS, GS`
      );
    }

    whereConditions.push({
      title: { equals: searchTitle as Title },
    });
  }

  // Filter by specialtyId (if provided)
  if (specialtyId && String(specialtyId).trim() !== "") {
    const numericSpecialtyId = Number(specialtyId);
    if (!Number.isNaN(numericSpecialtyId)) {
      whereConditions.push({ specialtyId: numericSpecialtyId });
    }
  }

  // Filter by clinicId (if provided)
  if (clinicId && String(clinicId).trim() !== "") {
    const numericClinicId = Number(clinicId);
    if (!Number.isNaN(numericClinicId)) {
      whereConditions.push({ clinicId: numericClinicId });
    }
  }
  const doctors = await prisma.doctor.findMany({
    include: {
      clinic: true,
      specialty: true,
    },
    where: {
      approvalStatus: ApprovalStatus.Approved,
      ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
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

const getDoctorByUserIdService = async (userId: string) => {
  const doctor = await findDoctorByUserId(userId);
  if (!doctor) {
    throw new Error("Doctor không tồn tại");
  }
  const userInfo = await getUserByIdViaRabbitMQ(doctor.userId);
  return {
    ...doctor,
    userInfo,
  };
};

export {
  createDoctorProfile,
  getDoctorByIdService,
  updateDoctorStatusService,
  handleGetAllDoctors,
  countTotalDoctorPage,
  handleGetAllApprovedDoctors,
  checkDoctorInfor,
  getDoctorByUserIdService,
};
