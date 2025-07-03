import express, { Express } from "express";
import { createScheduleController,getScheduleByDoctorIdController } from "src/controller/scheduleController";

import {
  authenticateToken,
  authorizeAdmin,
} from "src/middleware/auth.middleware";

const router = express.Router();

const scheduleRoutes = (app: Express) => {
  router.post(
    "/schedules",
    authenticateToken,
    authorizeAdmin,
    createScheduleController
  );
  router.get("/schedules/:doctorId", authenticateToken, authorizeAdmin, getScheduleByDoctorIdController);

  app.use("/", router);
};

export default scheduleRoutes;
