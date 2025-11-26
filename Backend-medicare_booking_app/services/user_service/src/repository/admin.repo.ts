import { prisma } from "src/config/client";

const createAdmin = async (
  userId: string,
  fullName: string,
  phone: string,
  avatarUrl: string
) => {
  const admin = await prisma.admin.create({
    data: {
      user_id: userId,
      full_name: fullName,
      phone,
      avatar_url: avatarUrl,
    },
  });

  return admin;
};

const findAdminByUserId = async (userId: string) => {
  const admin = await prisma.admin.findUnique({
    where: { user_id: userId },
  });
  return admin;
};

const getAllAdmin = async (
  skip: number,
  pageSize: number,
  fullName: string,
  phone: string
) => {
  const admins = await prisma.admin.findMany({
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
  return admins;
};

const deleteAdmin = async (id: string) => {
  const admin = await prisma.admin.delete({
    where: { id: id },
  });
  return admin;
};

const usernameFromEmail = (email: string) => {
  const local = email.trim().toLowerCase().split("@")[0];
  // Bỏ phần +tag của Gmail: user+abc@gmail.com -> user
  const noPlus = local.replace(/\+.*$/, "");
  // Giữ ký tự an toàn
  const safe = noPlus.replace(/[^a-z0-9._-]/g, "");
  return safe.slice(0, 30); // giới hạn chiều dài nếu muốn
};

const findAdminProfileByUserId = async (userId: string) => {
  const admin = await prisma.admin.findUnique({
    where: { user_id: userId },
  });
  return admin;
};

const createAdminProfile = async (userId: string, email: string) => {
  try {
    // Kiểm tra user đã có profile chưa
    const existingProfile = await findAdminProfileByUserId(userId);
    if (existingProfile) {
      return existingProfile;
    }

    const username = usernameFromEmail(email); // ví dụ: 'luluvogmot23'

    // Tạo profile cơ bản với default values
    const userProfile = await prisma.admin.create({
      data: {
        user_id: userId,
        full_name: username, // Default name, user có thể update sau
        phone: "", // Empty, user sẽ cập nhật sau
        avatar_url: "",
      },
    });
    return userProfile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

const createOneAdminProfile = async (admin: any) => {
  await prisma.admin.create({
    data: {
      user_id: admin.userId,
      full_name: admin.fullName,
      phone: admin.phone,
      avatar_url: admin.avatarUrl || "",
    },
  });
};

export {
  createOneAdminProfile,
  createAdmin,
  findAdminByUserId,
  getAllAdmin,
  deleteAdmin,
  createAdminProfile,
};
