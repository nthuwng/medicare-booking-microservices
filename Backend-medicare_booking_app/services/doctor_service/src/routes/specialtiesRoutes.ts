import express, { Express } from "express";
import {
  createSpecialtiesController,
  getSpecialtiesController,
} from "src/controller/specialtiesController";
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

router.get("/", authenticateToken, authorizeAdmin, getSpecialtiesController);

export default router;
