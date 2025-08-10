import express, { Express } from "express";
import {
  createClinicController,
  getClinicsController,
} from "src/controllers/clinicController";

import {
  authenticateToken,
  authorizeAdmin,
} from "src/middleware/auth.middleware";

const router = express.Router();

router.post("/", authenticateToken, authorizeAdmin, createClinicController);

router.get("/", authenticateToken, getClinicsController);

export default router;
