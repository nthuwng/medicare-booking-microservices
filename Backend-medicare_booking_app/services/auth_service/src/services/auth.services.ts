import {
  JwtPayload,
  LoginServiceResponse,
  RegisterServiceResponse,
} from "@shared/index";
import bcrypt from "bcrypt";
import { prisma } from "../config/client";
import { UserType } from "@prisma/client";
const saltRounds = 10;
import jwt from "jsonwebtoken";
import "dotenv/config";
import { config } from "../config/config.index";
import dayjs from "dayjs";
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
): Promise<RegisterServiceResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (existingUser) {
    return { success: false, message: "User đã tồn tại trong hệ thống" };
  }
  const user = await prisma.user.create({
    data: {
      email,
      password: newPassword,
      userType: userType as UserType,
    },
  });
  return { success: true, user };
};

const handleLoginApi = async (
  email: string,
  password: string
): Promise<LoginServiceResponse> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return { success: false, message: `Email: ${email} không tồn tại` };
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return { success: false, message: `Mật khẩu không chính xác` };
    }

    const payload = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
    };

    const secret = config.jwt.secret;
    const expiresIn: any = config.jwt.expiresIn;
    if (!secret) {
      return {
        success: false,
        message: `JWT_SECRET is not defined in environment variables`,
      };
    }
    const access_token = jwt.sign(payload, secret, {
      expiresIn: expiresIn,
    });

    // Generate refresh token
    const refreshSecret = config.jwt.refreshSecret;
    const refreshExpiresIn: any = config.jwt.refreshExpiresIn;
    if (!refreshSecret) {
      return {
        success: false,
        message: `JWT_REFRESH_SECRET is not defined in environment variables`,
      };
    }

    const refresh_token = jwt.sign(payload, refreshSecret, {
      expiresIn: refreshExpiresIn,
    });

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Note: This will work after running migration to create refresh_tokens table
    try {
      await prisma.refreshToken.create({
        data: {
          token: refresh_token,
          userId: user.id,
          expiresAt: expiresAt,
        },
      });
    } catch (error) {
      console.log("Refresh token table not created yet, skipping save");
    }

    return { access_token, refresh_token };
  } catch (error) {
    console.error("Error in handleLoginApi:", error);
    return { success: false, message: "Error in handleLoginApi:" };
  }
};

const verifyJwtToken = async (token: string): Promise<JwtPayload> => {
  const secret = config.jwt.secret;
  if (!secret)
    throw new Error("JWT_SECRET is not defined in environment variables");
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }
  const formatted = {
    ...decoded,
    iat: decoded.iat
      ? dayjs.unix(decoded.iat).format("YYYY-MM-DD HH:mm:ss")
      : undefined,
    exp: decoded.exp
      ? dayjs.unix(decoded.exp).format("YYYY-MM-DD HH:mm:ss")
      : undefined,
  };

  return formatted as JwtPayload;
};

const handleGetUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      userType: true,
      isActive: true,
    },
  });
  return user;
};

const handleGetUserByIdAndPassword = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  return user;
};

const handleGetAccount = async (token: string) => {
  const decoded = await verifyJwtToken(token);
  if (!decoded || !decoded.userId) {
    throw new Error("Token không hợp lệ");
  }
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      userType: true,
      isActive: true,
      createdAt: true,
    },
  });
  return user;
};

const handleChangePassword = async (id: string, password: string) => {
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });
  return user;
};

const verifyRefreshToken = async (token: string): Promise<JwtPayload> => {
  const refreshSecret = config.jwt.refreshSecret;
  if (!refreshSecret) {
    throw new Error(
      "JWT_REFRESH_SECRET is not defined in environment variables"
    );
  }

  const decoded = jwt.verify(token, refreshSecret);
  if (typeof decoded === "string") {
    throw new Error("Invalid refresh token payload");
  }

  const formatted = {
    ...decoded,
    iat: decoded.iat
      ? dayjs.unix(decoded.iat).format("YYYY-MM-DD HH:mm:ss")
      : undefined,
    exp: decoded.exp
      ? dayjs.unix(decoded.exp).format("YYYY-MM-DD HH:mm:ss")
      : undefined,
  };

  return formatted as JwtPayload;
};

const handleRefreshToken = async (refreshToken: string) => {
  try {
    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database and is not revoked
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!storedToken) {
      throw new Error("Invalid or expired refresh token");
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Generate new access token
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

    const newAccessToken = jwt.sign(payload, secret, {
      expiresIn: expiresIn,
    });

    // Generate new refresh token
    const refreshSecret = config.jwt.refreshSecret;
    const refreshExpiresIn: any = config.jwt.refreshExpiresIn;
    if (!refreshSecret) {
      throw new Error(
        "JWT_REFRESH_SECRET is not defined in environment variables"
      );
    }

    const newRefreshToken = jwt.sign(payload, refreshSecret, {
      expiresIn: refreshExpiresIn,
    });

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Save new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    try {
      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: user.id,
          expiresAt: expiresAt,
        },
      });
    } catch (error) {
      console.log("Error saving new refresh token:", error);
    }

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  } catch (error) {
    throw error;
  }
};

const handleRevokeRefreshToken = async (refreshToken: string) => {
  try {
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        isRevoked: false,
      },
    });

    if (storedToken) {
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      });
    }

    return true;
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
  handleGetUserById,
  handleGetAccount,
  handleChangePassword,
  handleGetUserByIdAndPassword,
  handleRefreshToken,
  handleRevokeRefreshToken,
  verifyRefreshToken,
};
