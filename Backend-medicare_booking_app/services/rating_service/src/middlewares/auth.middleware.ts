import { AuthVerifyResponse, UserType } from "@shared/index";
import { Request, Response, NextFunction } from "express";
import { verifyTokenViaRabbitMQ } from "src/queue/publishers/rating.publisher";

const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export { authenticateToken };
