import { Request, Response } from "express";
import {
  handleRegister,
  hashPassword,
  handleLoginApi,
  verifyJwtToken,
  handleGetAccount,
  handleChangePassword,
  comparePassword,
  handleGetUserByIdAndPassword,
  handleRefreshToken,
  handleRevokeRefreshToken,
  handleGetAllUsersAPI,
  handleLoginWithGoogleAPI,
  handleBulkCreateUsersAPI,
  handleForgotPassword,
  handleVerifyOtp,
  handleUpdatePasswordFromEmail,
  handleUpdateLockUser,
  handleCreateOneUserAPI,
  handleVerifyOtpRegister,
  handleResendOtpRegister,
} from "../services/auth.services";
import {
  changePasswordSchema,
  createUserSchema,
} from "../validation/user.validation";
import {
  JwtPayload,
  LoginResponse,
  RegisterResponse,
  VerifyTokenResponse,
  RefreshTokenResponse,
} from "@shared/interfaces/auth/IAuth";
import { UserType } from "@prisma/client";

const postRegisterAPI = async (req: Request, res: Response) => {
  try {
    const { email, password, userType } = req.body;
    const { error } = createUserSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }
    const newPassword = await hashPassword(password);

    const result = await handleRegister(email, newPassword, userType);

    if (result.success && result.user) {
      const response: RegisterResponse = {
        success: true,
        message:
          "Đăng ký thành công . Hãy kiểm tra email để xác thực tài khoản.",
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            userType: result.user.userType,
            createdAt: result.user.createdAt,
          },
        },
      };
      res.status(201).json(response);
    } else {
      const response: RegisterResponse = {
        success: false,
        message: result.success === false ? result.message : "Đăng ký thất bại",
        data: null,
      };
      res.status(400).json(response);
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      message: error,
    });
  }
};

const postLoginAPI = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const response: LoginResponse = {
        success: false,
        message: "Email và password là bắt buộc",
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const result = await handleLoginApi(email, password);
    // Check if result is an object with access_token (successful login)
    if (typeof result === "object" && "access_token" in result) {
      // Set refresh token as HTTP-only cookie
      res.cookie("refresh_token", result.refresh_token, {
        httpOnly: true,
        secure: false, // HTTPS only in production
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        path: "/",
      });

      const response: LoginResponse = {
        success: true,
        message: "Đăng nhập thành công",
        data: {
          access_token: result.access_token,
          token_type: "Bearer",
        },
      };
      res.status(200).json(response);
      return;
    }

    // Handle login failure (result is an object with success: false)
    const response: LoginResponse = {
      success: false,
      message: result.message || "Đăng nhập thất bại",
      data: null,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("Login error:", error);
    const response: LoginResponse = {
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
      data: null,
    };
    res.status(500).json(response);
  }
};

const postVerifyTokenAPI = async (req: Request, res: Response) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      const response: VerifyTokenResponse = {
        success: false,
        message: "Token không được cung cấp",
        data: {
          isValid: false,
          userId: null,
          email: null,
          userType: null,
        },
      };
      res.status(400).json(response);
      return;
    }

    const decoded = await verifyJwtToken(token);

    if (decoded) {
      const response: VerifyTokenResponse = {
        success: true,
        message: "Token hợp lệ",
        data: {
          userId: decoded.userId,
          email: decoded.email,
          userType: decoded.userType,
          isValid: true,
        },
      };
      res.status(200).json(response);
    } else {
      const response: VerifyTokenResponse = {
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
        data: {
          isValid: false,
          userId: null,
          email: null,
          userType: null,
        },
      };
      res.status(401).json(response);
    }
  } catch (error: any) {
    console.error("Lỗi khi xác thực token:", error.message);
    const response: VerifyTokenResponse = {
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
      data: {
        isValid: false,
        userId: null,
        email: null,
        userType: null,
      },
    };
    res.status(401).json(response);
  }
};

const getAccountApi = async (req: Request, res: Response) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Token không được cung cấp",
    });
    return;
  }
  try {
    const account = await handleGetAccount(token);
    res.status(200).json({
      success: true,
      message: "Lấy thông tin tài khoản thành công.",
      data: {
        user: account,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Lỗi khi lấy thông tin tài khoản.",
      data: null,
    });
  }
};

const putUpdatePasswordApi = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const { error } = changePasswordSchema.validate({
    oldPassword,
    newPassword,
    confirmPassword,
  });

  const checkUser = req.user as JwtPayload;
  if (checkUser?.userId !== id) {
    res.status(403).json({
      success: false,
      message: "Bạn chỉ có thể đổi mật khẩu của chính mình",
    });
    return;
  }
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  const user = await handleGetUserByIdAndPassword(id);

  const checkPassword = await comparePassword(
    oldPassword,
    user?.password || ""
  );
  if (!checkPassword) {
    res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
    return;
  }

  try {
    await handleChangePassword(id, newPassword);
    res
      .status(200)
      .json({ success: true, message: "Mật khẩu đã được thay đổi thành công" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thay đổi mật khẩu người dùng.",
      data: null,
    });
  }
};

const postRefreshTokenApi = async (req: Request, res: Response) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    if (!refresh_token) {
      res.status(400).json({
        success: false,
        message: "Refresh token không tìm thấy trong cookie",
        data: null,
      });
      return;
    }

    const result = await handleRefreshToken(refresh_token);

    // Set new refresh token as HTTP-only cookie
    res.cookie("refresh_token", result.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: "/",
    });

    const response: RefreshTokenResponse = {
      success: true,
      message: "Refresh token thành công",
      data: {
        access_token: result.access_token,
        token_type: "Bearer",
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Refresh token error:", error);
    const response: RefreshTokenResponse = {
      success: false,
      message: error.message || "Refresh token thất bại",
      data: null,
    };
    res.status(401).json(response);
  }
};

const postRevokeRefreshTokenApi = async (req: Request, res: Response) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    if (!refresh_token) {
      res.status(400).json({
        success: false,
        message: "Refresh token không tìm thấy trong cookie",
      });
      return;
    }

    await handleRevokeRefreshToken(refresh_token);

    // Clear the refresh token cookie
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error: any) {
    console.error("Revoke refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đăng xuất",
    });
  }
};

const getRefreshTokenApi = async (req: Request, res: Response) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Token không được cung cấp",
    });
    return;
  }
  try {
    const decoded = await verifyJwtToken(token);
    if (decoded) {
      const response: VerifyTokenResponse = {
        success: true,
        message: "Token hợp lệ",
        data: {
          userId: decoded.userId,
          email: decoded.email,
          userType: decoded.userType,
          isValid: true,
        },
      };
      res.status(200).json(response);
    } else {
      res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin tài khoản.",
      data: null,
    });
  }
};

const getAllUsersAPI = async (req: Request, res: Response) => {
  const { page, pageSize, email, userType, isActive } = req.query;
  let currentPage = page ? +page : 1;
  if (currentPage <= 0) {
    currentPage = 1;
  }
  const size = Math.max(1, Math.min(100, Number(pageSize) || 10));
  const { users, totalItems } = await handleGetAllUsersAPI(
    currentPage,
    parseInt(pageSize as string),
    email as string,
    userType as UserType,
    isActive as string
  );

  const pages = Math.max(1, Math.ceil(totalItems / size));
  if (!users.length) {
    res.status(200).json({
      success: true,
      message: "Không có người dùng nào trong trang này",
      data: {
        meta: {
          currentPage: currentPage,
          pageSize: parseInt(pageSize as string),
          pages: pages,
          total: totalItems,
        },
        result: [],
      },
    });
    return;
  }
  res.status(200).json({
    success: true,
    length: totalItems,
    message: "Lấy danh sách tất cả người dùng thành công.",
    data: {
      meta: {
        currentPage: currentPage,
        pageSize: parseInt(pageSize as string),
        pages: pages,
        total: totalItems,
      },
      result: users,
    },
  });
};

const postLoginWithGoogleAPI = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    const result = await handleLoginWithGoogleAPI(credential);

    if (typeof result === "object" && "access_token" in result) {
      // Set refresh token as HTTP-only cookie
      res.cookie("refresh_token", result.refresh_token, {
        httpOnly: true,
        secure: false, // HTTPS only in production
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        path: "/",
      });

      const response: LoginResponse = {
        success: true,
        message: "Đăng nhập thành công",
        data: {
          access_token: result.access_token,
          token_type: "Bearer",
        },
      };
      res.status(200).json(response);
      return;
    }

    // Handle login failure (result is an object with success: false)
    const response: LoginResponse = {
      success: false,
      message: result.message || "Đăng nhập thất bại",
      data: null,
    };
    res.status(401).json(response);
  } catch (error) {
    console.error("Login error:", error);
    const response: LoginResponse = {
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
      data: null,
    };
    res.status(500).json(response);
  }
};

const bulkCreateUsersAPI = async (req: Request, res: Response) => {
  try {
    const users = req.body;
    const result = await handleBulkCreateUsersAPI(users);

    if (result.success) {
      // Trường hợp thành công
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          countSuccess: result.countSuccess,
          countError: result.countError,
          detail: result.detail,
        },
      });
    } else {
      // Trường hợp thất bại
      res.status(400).json({
        success: false,
        message: result.message,
        data: {
          countSuccess: result.countSuccess || 0,
          countError: result.countError || 0,
          detail: result.detail,
          existingEmails: result.existingEmails || null,
        },
      });
    }
  } catch (error) {
    console.error("Bulk create users error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tạo người dùng",
      data: {
        countSuccess: 0,
        countError: req.body?.length || 0,
        detail: error instanceof Error ? error.message : "Lỗi không xác định",
      },
    });
  }
};

const postForgetPasswordApi = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      success: false,
      message: "Email là bắt buộc",
      data: null,
    });
    return;
  }

  const password = await handleForgotPassword(email);

  if (password?.success === false) {
    res.status(404).json({
      success: false,
      message: password.message,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "OTP đã được gửi đến email của bạn",
  });
};

const postVerifyOtpApi = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({
      success: false,
      message: "Email và OTP là bắt buộc",
      data: null,
    });
    return;
  }

  const result = await handleVerifyOtp(email, otp);

  if (result.success === false) {
    res.status(400).json({
      success: false,
      message: result.message,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

const putUpdatePasswordFromEmailApi = async (req: Request, res: Response) => {
  const { passwordEmail, password, confirmPassword } = req.body;
  const { email } = req.params;

  if (!passwordEmail || !password || !confirmPassword) {
    res.status(400).json({
      success: false,
      message: "Email, mật khẩu mới và xác nhận mật khẩu là bắt buộc",
    });
    return;
  }

  const result = await handleUpdatePasswordFromEmail(
    email,
    passwordEmail,
    password,
    confirmPassword
  );

  if (result.success === false) {
    res.status(400).json({
      success: false,
      message: result.message,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

const putUpdateLockUserApi = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { lock } = req.body;

  const result = await handleUpdateLockUser(id, lock);

  if (!result) {
    res.status(400).json({
      success: false,
      message: "Không thể cập nhật trạng thái khóa người dùng",
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

const createOneUserAPI = async (req: Request, res: Response) => {
  const result = await handleCreateOneUserAPI(req.body);
  if (result.success === false) {
    res.status(201).json({
      success: result.success,
      message: result.message,
    });
    return;
  }
  res.status(200).json({
    success: result.success,
    message: result.message,
  });
};

const postVerifyOtpRegisterApi = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({
      success: false,
      message: "Email và OTP là bắt buộc",
      data: null,
    });
    return;
  }

  const result = await handleVerifyOtpRegister(email, otp);

  if (result.success === false) {
    res.status(400).json({
      success: false,
      message: result.message,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

const postResendOtpRegisterApi = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      success: false,
      message: "Email là bắt buộc",
      data: null,
    });
    return;
  }

  const password = await handleResendOtpRegister(email);

  if (password?.success === false) {
    res.status(404).json({
      success: false,
      message: password.message,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "OTP đã được gửi đến email của bạn",
  });
};

export {
  postRegisterAPI,
  createOneUserAPI,
  postLoginAPI,
  postVerifyTokenAPI,
  getAccountApi,
  putUpdatePasswordApi,
  postRefreshTokenApi,
  postRevokeRefreshTokenApi,
  getAllUsersAPI,
  getRefreshTokenApi,
  postLoginWithGoogleAPI,
  bulkCreateUsersAPI,
  postForgetPasswordApi,
  postVerifyOtpApi,
  putUpdateLockUserApi,
  putUpdatePasswordFromEmailApi,
  postVerifyOtpRegisterApi,
  postResendOtpRegisterApi,
};
