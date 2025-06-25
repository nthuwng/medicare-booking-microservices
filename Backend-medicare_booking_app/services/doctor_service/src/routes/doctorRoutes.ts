import express, { Express } from "express";
import { createDoctorController,getDoctorByIdController,updateDoctorStatusController } from "../controller/doctorController";
import { authenticateToken, authorizeAdmin } from "src/middleware/auth.middleware";

const router = express.Router();

const doctorRoutes = (app: Express) => {
  router.post("/", authenticateToken, createDoctorController);
  router.get("/:id", authenticateToken, getDoctorByIdController);
  router.put("/:id", authenticateToken, authorizeAdmin, updateDoctorStatusController);

  app.use("/", router);
};

export default doctorRoutes;
