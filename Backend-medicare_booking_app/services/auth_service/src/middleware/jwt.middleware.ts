import { Request, Response, NextFunction } from "express";
import { UserType } from "@shared/index";
import "dotenv/config";
import { verifyJwtToken } from "src/services/auth.services";

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  (async () => {
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
  })();
};

export { authenticateToken };
