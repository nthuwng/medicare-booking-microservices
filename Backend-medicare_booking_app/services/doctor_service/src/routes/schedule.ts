import express, { Express } from "express";
import {
  createScheduleController,
  getScheduleByDoctorIdController,
} from "src/controller/scheduleController";

import {
  authenticateToken,
  authorizeAdmin,
  authorizeDoctor,
} from "src/middleware/auth.middleware";

const router = express.Router();

router.post("/", authenticateToken, authorizeDoctor, createScheduleController);
router.get(
  "/",
  authenticateToken,
  authorizeDoctor,
  getScheduleByDoctorIdController
);

export default router;
