import {
  JwtPayload,
  JwtPayloadGoogle,
  LoginServiceResponse,
  RegisterServiceResponse,
} from "@shared/index";
import bcrypt from "bcrypt";
import { prisma } from "../config/client";
import { AuthProvider, UserType } from "@prisma/client";
const saltRounds = 10;
import jwt from "jsonwebtoken";
import "dotenv/config";
import { config } from "../config/config.index";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import {
  createUserProfileViaRabbitMQ,
  importDoctorProfilesViaRabbitMQ,
  sendEmailForgotPassword,
  sendEmailResetPassword,
} from "src/queue/publishers/auth.publisher";
import { randomUUID } from "crypto";

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
      verificationOtp: "",
    },
  });

  if (userType === UserType.PATIENT) {
    await createUserProfileViaRabbitMQ(user.id, email);
  }

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

    if (user.isActive === false) {
      return {
        success: false,
        message: `Tài khoản của bạn đã bị khóa . Vui lòng liên hệ ADMIN .`,
      };
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
      authProvider: true,
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
      authProvider: true,
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

    // Thêm timestamp để tránh trùng token
    const newRefreshToken = jwt.sign(
      { ...payload, timestamp: Date.now() },
      refreshSecret,
      {
        expiresIn: refreshExpiresIn,
      }
    );

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

const countTotalUserPage = async (pageSize: number) => {
  const totalItems = await prisma.user.count();

  const totalPages = Math.ceil(totalItems / pageSize);

  return totalPages;
};

const handleGetAllUsersAPI = async (
  page: number,
  pageSize: number,
  email: string,
  userType: string,
  isActive: string
) => {
  const skip = (page - 1) * pageSize;

  // Build where conditions
  const whereConditions: any[] = [];

  if (email && email.trim() !== "") {
    whereConditions.push({
      email: { contains: email },
    });
  }

  if (userType && userType.trim() !== "") {
    whereConditions.push({
      userType: { equals: userType as UserType },
    });
  }

  if (isActive && isActive.trim() !== "") {
    whereConditions.push({
      isActive: { equals: isActive === "true" },
    });
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        userType: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        email: {
          contains: email || "",
        },
        userType: userType ? (userType as UserType) : undefined,
        isActive: isActive ? isActive === "true" : undefined,
      },
      skip: skip,
      take: pageSize,
    }),

    prisma.user.count({
      where: whereConditions.length > 0 ? { AND: whereConditions } : {},
    }),
    countTotalUser(),
  ]);
  return {
    users: users,
    totalItems: total,
  };
};

const handleGetAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      authProvider: true,
      userType: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return users;
};

const countTotalUser = async () => {
  const totalItems = await prisma.user.count();
  return totalItems;
};

const handleLoginWithGoogleAPI = async (
  credential: string
): Promise<LoginServiceResponse> => {
  try {
    if (!credential) {
      return { success: false, message: "Thiếu google token" };
    }
    const dataDecoded = jwt.decode(credential) as JwtPayloadGoogle;

    if (!dataDecoded) {
      return { success: false, message: "Google token không hợp lệ" };
    }

    const emailVerified = dataDecoded?.email as string;

    let user = await prisma.user.findUnique({
      where: {
        email: emailVerified,
      },
    });

    if (!user) {
      const randomPassword = `${Math.random()
        .toString(36)
        .slice(2)}${Date.now()}`;
      const hashed = await hashPassword(randomPassword);
      user = await prisma.user.create({
        data: {
          email: emailVerified,
          password: hashed,
          userType: UserType.PATIENT,
          authProvider: AuthProvider.GOOGLE,
          verificationOtp: "",
        },
      });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
    };

    await createUserProfileViaRabbitMQ(payload.userId, payload.email);

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

    const refreshSecret = config.jwt.refreshSecret;
    const refreshExpiresIn: any = config.jwt.refreshExpiresIn;
    if (!refreshSecret) {
      return {
        success: false,
        message: `JWT_REFRESH_SECRET is not defined in environment variables`,
      };
    }

    const refresh_token = jwt.sign(
      { ...payload, timestamp: Date.now() },
      refreshSecret,
      {
        expiresIn: refreshExpiresIn,
      }
    );

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

const handleBulkCreateUsersAPI = async (users: any[]) => {
  try {
    // 1️⃣ Kiểm tra email trùng
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: users.map((u) => u.email.trim().toLowerCase()),
        },
      },
      select: { id: true, email: true },
    });

    const existingEmails = existingUsers.map((u) => u.email);
    const newUsers = users.filter(
      (u) => !existingEmails.includes(u.email.trim().toLowerCase())
    );

    // 2️⃣ Nếu tất cả đều trùng
    if (newUsers.length === 0) {
      return {
        success: false,
        message: "Tất cả người dùng đã tồn tại",
        detail: `Email đã tồn tại: ${existingEmails.join(", ")}`,
        countSuccess: 0,
        countError: existingEmails.length,
        existingEmails,
      };
    }

    // 3️⃣ Hash password + tạo user tuần tự để lấy id
    const createdUsers: { email: string; id: string }[] = [];

    for (const user of newUsers) {
      const hashed = await hashPassword(user.password);
      const created = await prisma.user.create({
        data: {
          email: user.email.trim().toLowerCase(),
          password: hashed,
          userType: user.userType,
          verificationOtp: "",
        },
        select: { id: true, email: true },
      });
      createdUsers.push(created);
    }

    // 4️⃣ Gộp userId vào từng dòng (bao gồm cả user đã tồn tại)
    const mergedData = users.map((u) => {
      const foundNew = createdUsers.find(
        (c) => c.email === u.email.trim().toLowerCase()
      );
      const foundOld = existingUsers.find(
        (e) => e.email === u.email.trim().toLowerCase()
      );

      return {
        ...u,
        userId: foundNew?.id || foundOld?.id || null,
      };
    });
    // 5️⃣ Gửi qua RabbitMQ cho doctor_service xử lý
    await importDoctorProfilesViaRabbitMQ(mergedData);

    // 6️⃣ Trả về kết quả chi tiết
    return {
      success: true,
      message: "Tạo người dùng và gửi dữ liệu bác sĩ thành công",
      detail: `Tạo mới ${createdUsers.length} người dùng, ${existingEmails.length} đã tồn tại.`,
      countSuccess: createdUsers.length,
      countError: existingEmails.length,
      existingEmails,
    };
  } catch (error: any) {
    console.error("Error in handleBulkCreateUsersAPI:", error);
    return {
      success: false,
      message: "Lỗi khi tạo người dùng",
      detail: error.message || "Lỗi không xác định",
      countSuccess: 0,
      countError: users.length,
      existingEmails: [],
    };
  }
};

const handleForgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "Email không tồn tại trong hệ thống.",
    };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 số
  const expUtc = dayjs.utc().add(3, "minute").toDate();

  await prisma.user.update({
    where: { email },
    data: {
      verificationOtp: otp,
      verificationOtpExp: expUtc,
    },
  });

  await sendEmailForgotPassword(email, otp);

  return null;
};

const handleVerifyOtp = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "Email không tồn tại trong hệ thống.",
    };
  }

  if (user.verificationOtp !== otp) {
    return {
      success: false,
      message: "Mã OTP không đúng.",
    };
  }

  const nowUtc = dayjs.utc();
  const expUtc = dayjs(user.verificationOtpExp).utc();
  const expired = nowUtc.valueOf() >= expUtc.valueOf();

  if (expired) {
    return { success: false, message: "Mã OTP đã hết hạn." };
  }

  const newPassword = randomUUID().slice(0, 8); // Lấy 8 ký tự đầu

  await prisma.user.update({
    where: { email },
    data: {
      password: await hashPassword(newPassword),
      authProvider: AuthProvider.EMAIL,
      verificationOtp: null,
      verificationOtpExp: null,
    },
  });

  await sendEmailResetPassword(email, newPassword);

  return {
    success: true,
    message: "Xác thực OTP thành công. Mật khẩu mới đã được gửi qua email.",
  };
};

const handleUpdatePasswordFromEmail = async (
  email: string,
  passwordEmail: string,
  password: string,
  confirmPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "Email không tồn tại trong hệ thống.",
    };
  }

  const checkPassword = await comparePassword(
    passwordEmail,
    user?.password || ""
  );

  if (!checkPassword) {
    return {
      success: false,
      message: "Mật khẩu không chính xác.",
    };
  }

  await prisma.user.update({
    where: { email },
    data: { password: password },
  });

  const hashedPassword = await hashPassword(password);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  return {
    success: true,
    message: "Đổi mật khẩu thành công.",
  };
};

const handleUpdateLockUser = async (id: string, isActive: boolean) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  if (!user) {
    return {
      success: false,
      message: "Người dùng không tồn tại trong hệ thống.",
    };
  }
  await prisma.user.update({
    where: { id },
    data: { isActive },
  });
  return {
    success: true,
    message: isActive
      ? "Mở khóa người dùng thành công."
      : "Khóa người dùng thành công.",
  };
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
  handleGetAllUsers,
  handleGetAllUsersAPI,
  countTotalUserPage,
  countTotalUser,
  handleLoginWithGoogleAPI,
  handleBulkCreateUsersAPI,
  handleForgotPassword,
  handleVerifyOtp,
  handleUpdatePasswordFromEmail,
  handleUpdateLockUser,
};
