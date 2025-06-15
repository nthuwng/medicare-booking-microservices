import express, { Express } from "express";
import {
  postRegisterAPI,
  postLoginAPI,
  postVerifyTokenAPI,
  getUserByIdApi,
} from "../controller/auth.controller";

const router = express.Router();

const authRoutes = (app: Express) => {
  router.post("/register", postRegisterAPI);
  router.post("/login", postLoginAPI);
  router.post("/verify-token", postVerifyTokenAPI);
  router.get("/users/:id", getUserByIdApi);

  app.use("/", router);
};

export default authRoutes;
