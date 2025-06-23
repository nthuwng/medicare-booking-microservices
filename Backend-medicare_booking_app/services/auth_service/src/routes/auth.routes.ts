import express, { Express } from "express";
import {
  postRegisterAPI,
  postLoginAPI,
  postVerifyTokenAPI,
  getAccountApi,
  putUpdatePasswordApi,
} from "../controllers/auth.controller";
import { authenticateToken } from "src/middleware/jwt.middleware";

const router = express.Router();

const authRoutes = (app: Express) => {
  router.post("/register", postRegisterAPI);
  router.post("/login", postLoginAPI);
  router.post("/verify-token", postVerifyTokenAPI);
  router.get("/account", getAccountApi);
  router.put("/users/:id/password",authenticateToken, putUpdatePasswordApi);

  app.use("/", router);
};

export default authRoutes;
