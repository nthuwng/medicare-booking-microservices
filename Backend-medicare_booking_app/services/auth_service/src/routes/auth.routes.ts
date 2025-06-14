import express, { Express } from "express";
import {
  postRegisterAPI,
  postLoginAPI,
  postVerifyTokenAPI,
} from "../controller/auth.controller";

const router = express.Router();

const authRoutes = (app: Express) => {
  router.post("/register", postRegisterAPI);
  router.post("/login", postLoginAPI);
  router.post("/verify-token", postVerifyTokenAPI);
  
  app.use("/", router);
};

export default authRoutes;
