import { Request, Response, NextFunction } from "express";
import { UserType } from "../../shared/index";
import "dotenv/config";
import { verifyJwtToken } from "src/services/auth.services";

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
    const verifyResult = await verifyJwtToken(token);
    // Gán user info vào req.user
    req.user = {
      userId: verifyResult.userId || "",
      email: verifyResult.email || "",
      userType: verifyResult.userType as UserType,
      iat: verifyResult.iat || "",
      exp: verifyResult.exp || "",
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

    if (req.user?.userType !== UserType.ADMIN) {
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

export { authenticateToken, authorizeAdmin };
