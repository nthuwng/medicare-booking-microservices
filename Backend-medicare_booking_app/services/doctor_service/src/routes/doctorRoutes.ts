import express, { Express } from "express";
import { createDoctorController } from "../controller/doctorController";

const router = express.Router();

const doctorRoutes = (app: Express) => {
  router.post("/", createDoctorController);

  app.use("/", router);
};

export default doctorRoutes;
