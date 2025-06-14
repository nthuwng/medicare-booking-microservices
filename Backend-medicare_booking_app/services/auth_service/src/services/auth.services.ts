import bcrypt from "bcrypt";
import { prisma } from "../config/client";
import { UserType } from "@prisma/client";
const saltRounds = 10;
import jwt from "jsonwebtoken";
import "dotenv/config";
import { config } from "../config/config.index";

const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
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

const handleLoginApi = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error(`Email: ${email} not found`);
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new Error(`Invalid password`);
  }

  const payload = {
    userId: user.id,
    email: user.email,
    userType: user.userType,
  };

  const secret = config.jwt.secret;
  const expiresIn: any = config.jwt.expiresIn;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  const access_token = jwt.sign(payload, secret, {
    expiresIn: expiresIn,
  });
  return access_token;
};

interface JwtPayload {
  userId: string;
  email: string;
  userType: UserType;
}

const verifyJwtToken = async (token: string): Promise<JwtPayload | null> => {
  const secret = config.jwt.secret;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    throw error;
  }
};

export {
  hashPassword,
  handleRegister,
  handleLoginApi,
  comparePassword,
  verifyJwtToken,
};
