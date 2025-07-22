import express, { Express } from "express";
import {
  createClinicController,
  getClinicsController,
} from "src/controller/clinicController";

import {
  authenticateToken,
  authorizeAdmin,
} from "src/middleware/auth.middleware";

const router = express.Router();

router.post("/", authenticateToken, authorizeAdmin, createClinicController);

router.get("/", authenticateToken, authorizeAdmin, getClinicsController);

export default router;
