import express, { Express } from "express";
import { postRegister } from "../controller/auth.controller";

const router = express.Router();

const authRoutes = (app: Express) => {
  router.post("/register", postRegister);

  app.use("/", router);
};

export default authRoutes;
