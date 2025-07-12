import { AuthVerifyResponse, UserType } from "@shared/index";
import { Request, Response, NextFunction } from "express";
import {
  checkAdminViaRabbitMQ,
  checkDoctorViaRabbitMQ,
  verifyTokenViaRabbitMQ,
} from "src/queue/publishers/doctor.publisher";

const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Access token is required",
        });
        return;
      }

      // Xác thực token qua RabbitMQ
      const verifyResult = (await verifyTokenViaRabbitMQ(
        token
      )) as AuthVerifyResponse;

      if (!verifyResult.success || verifyResult.data.isValid === false) {
        res.status(401).json({
          success: false,
          message: verifyResult.message,
        });
        return;
      }

      // Gán user info vào req.user
      req.user = {
        userId: verifyResult.data.userId || "",
        email: verifyResult.data.email || "",
        userType: verifyResult.data.userType as UserType,
        iat: verifyResult.data.iat || "",
        exp: verifyResult.data.exp || "",
      };

      next();
    } catch (error: any) {
      console.error("Auth middleware error:", error.message);
      res.status(500).json({
        success: false,
        message: "Authentication service error",
      });
    }
};

const authorizeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Missing userId" });
      return;
    }

    const isAdmin = await checkAdminViaRabbitMQ(userId);
    if (isAdmin.isAdmin === false) {
      res.status(403).json({
        success: false,
        message: "Bạn không phải là admin, bạn không có quyền truy cập.",
      });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Authorization service error" });
  }
};

const authorizeDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Missing userId" });
      return;
        }

    const isDoctor = await checkDoctorViaRabbitMQ(userId);
    if (isDoctor.isDoctor === false) {
      res.status(403).json({
        success: false,
        message: "Bạn không phải là bác sĩ, bạn không có quyền truy cập.",
      });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Authorization service error" });
  }
};


export { authenticateToken, authorizeAdmin,authorizeDoctor };
