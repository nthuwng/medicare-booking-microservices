import express, { Express } from "express";
import {
  createFeeController,
  getFeeController,
} from "src/controller/feeController";

import {
  authenticateToken,
  authorizeAdmin,
} from "src/middleware/auth.middleware";

const router = express.Router();

router.post(
  "/:doctorProfileId",
  authenticateToken,
  authorizeAdmin,
  createFeeController
);
router.get(
  "/:doctorProfileId",
  authenticateToken,
  authorizeAdmin,
  getFeeController
);

export default router;
