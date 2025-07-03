import { prisma } from "../config/client";
import {
  createAdmin,
  deleteAdmin,
  findAdminByUserId,
  getAllAdmin,
} from "src/repository/admin.repo";
import { CreateAdminProfileData, UserInfo } from "@shared/index";
import { getUserByIdViaRabbitMQ } from "src/queue/publishers/user.publisher";

const createAdminProfile = async (
  body: CreateAdminProfileData,
  userId: string
) => {
  const { fullName, phone, avatarUrl } = body;

  //Kiểm tra user có tồn tại trong auth_service
  const userInfo = await checkUserExits(userId);

  const admin = await checkTypeAndCreateAdminProfile(
    userId,
    fullName,
    phone,
    avatarUrl || ""
  );

  return {
    ...admin,
    userInfo,
  };
};

const checkUserExits = async (userId: string) => {
  const userExits = (await getUserByIdViaRabbitMQ(userId)) as UserInfo;

  if (!userExits || !userExits.userType) {
    throw new Error("User không tồn tại trong auth_service");
  }

  // Kiểm tra xem admin profile đã tồn tại chưa
  const existingAdmin = await findAdminByUserId(userId);

  if (existingAdmin) {
    throw new Error("Admin profile đã tồn tại cho user này");
  }

  return userExits;
};

const checkTypeAndCreateAdminProfile = async (
  userId: string,
  fullName: string,
  phone: string,
  avatarUrl: string
) => {
  const userType = (await getUserByIdViaRabbitMQ(userId)) as UserInfo;

  if (userType.userType !== "ADMIN") {
    throw new Error("User này không phải là ADMIN");
  }
  const admin = await createAdmin(userId, fullName, phone, avatarUrl);
  return admin;
};

const getAdminByIdService = async (id: string) => {
  //Lấy admin từ database
  const admin = await prisma.admin.findUnique({
    where: { id: id },
  });

  //Lấy user_id từ admin
  const userId = await prisma.admin.findUnique({
    where: { id: id },
    select: {
      user_id: true,
    },
  });

  if (!userId?.user_id) {
    throw new Error("User ID not found");
  }

  //Gọi sang auth_service để lấy thông tin user
  const userInfo = await getUserByIdViaRabbitMQ(userId.user_id);

  return {
    ...admin,
    userInfo,
  };
};

const getAllAdminService = async () => {
  const admins = await getAllAdmin();
  return admins;
};

const deleteAdminService = async (id: string) => {
  const admin = await deleteAdmin(id);
  return admin;
};

export {
  createAdminProfile,
  getAdminByIdService,
  checkTypeAndCreateAdminProfile,
  checkUserExits,
  getAllAdminService,
  deleteAdminService,
};
