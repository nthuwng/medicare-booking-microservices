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

const getAllAdmin = async () => {
  const admins = await prisma.admin.findMany();
  return admins;
};

const deleteAdmin = async (id: string) => {
  const admin = await prisma.admin.delete({
    where: { id: id },
  });
  return admin;
};

export { createAdmin, findAdminByUserId, getAllAdmin, deleteAdmin };
