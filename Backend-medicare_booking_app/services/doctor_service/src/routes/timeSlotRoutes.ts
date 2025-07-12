import express, { Express } from "express";
import { createTimeSlotController,getAllTimeSlotsController } from "src/controller/timeSlotController";
import {
  authenticateToken,
  authorizeAdmin,
} from "src/middleware/auth.middleware";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeAdmin,
  createTimeSlotController
);

router.get("/", authenticateToken, authorizeAdmin, getAllTimeSlotsController);

export default router;
