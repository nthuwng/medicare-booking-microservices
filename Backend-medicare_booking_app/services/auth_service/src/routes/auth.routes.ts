import express, { Express } from "express";
import {
  postRegisterAPI,
  postLoginAPI,
  postVerifyTokenAPI,
  getAccountApi,
  putUpdatePasswordApi,
  postRefreshTokenApi,
  postRevokeRefreshTokenApi,
  getAllUsersAPI,
  postLoginWithGoogleAPI,
  bulkCreateUsersAPI,
  postForgetPasswordApi,
  postVerifyOtpApi,
  putUpdatePasswordFromEmailApi,
  putUpdateLockUserApi, 
} from "../controllers/auth.controller";
import {
  authenticateToken,
  authorizeAdmin,
} from "src/middleware/jwt.middleware";

const router = express.Router();

const authRoutes = (app: Express) => {
  router.post("/register", postRegisterAPI);
  router.get("/", authenticateToken, authorizeAdmin, getAllUsersAPI);
  router.post("/login", postLoginAPI);
  router.post("/login-with-google", postLoginWithGoogleAPI);
  router.post("/verify-token", postVerifyTokenAPI);
  router.get("/account", getAccountApi);
  router.post("/refresh-token", postRefreshTokenApi);
  router.post("/revoke-token", postRevokeRefreshTokenApi);
  router.put("/users/:id/password", authenticateToken, putUpdatePasswordApi);
  router.post("/bulk-create-users", bulkCreateUsersAPI);

  router.post("/forgot-password", postForgetPasswordApi);
  router.post("/verify-otp", postVerifyOtpApi);
  router.post("/resend-otp", postForgetPasswordApi);
  router.put("/change-password-email/:email", putUpdatePasswordFromEmailApi);
  router.put("/lock-user/:id", putUpdateLockUserApi);

  app.use("/", router);
};

export default authRoutes;
