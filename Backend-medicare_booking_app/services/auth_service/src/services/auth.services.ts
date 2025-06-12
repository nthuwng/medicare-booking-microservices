import bcrypt from "bcrypt";
import { prisma } from "../config/client";
import { UserType } from "@prisma/client";
const saltRounds = 10;

const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

const handleRegister = async (
  email: string,
  newPassword: string,
  userType: string
) => {
  const user = await prisma.user.create({
    data: {
      email,
      password: newPassword,
      userType: userType as UserType,
    },
  });
  return user;
};
export { hashPassword, handleRegister };
