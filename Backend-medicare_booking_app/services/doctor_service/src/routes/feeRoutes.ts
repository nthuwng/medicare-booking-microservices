import express, { Express } from "express";
import { createFeeController,getFeeController } from "src/controller/feeController";

import {
  authenticateToken,
  authorizeAdmin,
} from "src/middleware/auth.middleware";

const router = express.Router();

const feeRoutes = (app: Express) => {
  router.post("/:doctorProfileId/fee", authenticateToken, authorizeAdmin, createFeeController);
  router.get("/:doctorProfileId/fee", authenticateToken, authorizeAdmin, getFeeController);

  app.use("/", router);
};

export default feeRoutes;
