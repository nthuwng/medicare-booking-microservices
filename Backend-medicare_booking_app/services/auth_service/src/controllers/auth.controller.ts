import { Request, Response } from "express";
import {
  handleRegister,
  hashPassword,
  handleLoginApi,
  verifyJwtToken,
  handleGetAccount,
  handleChangePassword,
  comparePassword,
  handleGetUserById,
  handleGetUserByIdAndPassword,
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
} from "@shared/interfaces/auth/IAuth";

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
        message: "User registered successfully",
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
        message:
          result.success === false ? result.message : "Registration failed",
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
    // Check if result is a string (successful login returns token)
    if (typeof result === "string") {
      const response: LoginResponse = {
        success: true,
        message: "Đăng nhập thành công",
        data: {
          access_token: result,
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
      data: account,
    });
  } catch (error) {
    res.status(500).json({
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

export {
  postRegisterAPI,
  postLoginAPI,
  postVerifyTokenAPI,
  getAccountApi,
  putUpdatePasswordApi,
};
