import express, { Express } from "express";
import {
  createSpecialtiesController,
  getSpecialtiesController,
} from "src/controllers/specialtiesController";
import {
  authenticateToken,
  authorizeAdmin,
} from "src/middleware/auth.middleware";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeAdmin,
  createSpecialtiesController
);

router.get("/", authenticateToken, getSpecialtiesController);

export default router;
