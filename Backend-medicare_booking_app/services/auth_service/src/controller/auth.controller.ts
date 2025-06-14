import { Request, Response } from "express";
import {
  handleRegister,
  hashPassword,
  handleLoginApi,
  verifyJwtToken,
} from "../services/auth.services";
import { createUserSchema } from "../validation/user.validation";

const postRegisterAPI = async (req: Request, res: Response) => {
  try {
    const { email, password, userType } = req.body;
    const { error } = createUserSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }
    const newPassword = await hashPassword(password);

    const user = await handleRegister(email, newPassword, userType);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          userType: user.userType,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: error,
    });
  }
};

const postLoginAPI = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const access_token = await handleLoginApi(email, password);
    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      data: { access_token },
    });
  } catch (error: any) {
    res.status(401).json({
      data: null,
      message: error.message,
    });
  }
};

const postVerifyTokenAPI = async (req: Request, res: Response) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Token không được cung cấp.",
        data: { isValid: false, userId: null, email: null, userType: null },
      });
      return;
    }

    const decoded = await verifyJwtToken(token);

    if (decoded) {
      res.status(200).json({
        success: true,
        message: "Token hợp lệ.",
        data: {
          userId: decoded.userId,
          email: decoded.email,
          userType: decoded.userType,
          isValid: true,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn.",
        data: { isValid: false, userId: null, email: null, userType: null },
      });
    }
  } catch (error: any) {
    console.error("Lỗi khi xác thực token:", error.message);
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn.",
      data: { isValid: false, userId: null, email: null, userType: null },
    });
  }
};

export { postRegisterAPI, postLoginAPI, postVerifyTokenAPI };
