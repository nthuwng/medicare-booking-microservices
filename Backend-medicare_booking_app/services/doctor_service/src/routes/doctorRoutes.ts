import express, { Express } from "express";
import {
  createDoctorController,
  getDoctorByIdController,
  updateDoctorStatusController,
  getAllDoctorsController,
  getAllApprovedDoctorsController,
  getDoctorByUserIdController
} from "../controllers/doctorController";
import {
  authenticateToken,
  authorizeAdmin,
} from "src/middleware/auth.middleware";

const router = express.Router();
// Basic doctor operations
router.post("/", authenticateToken, createDoctorController);
router.get("/", authenticateToken, getAllDoctorsController);
router.get("/approved", authenticateToken, getAllApprovedDoctorsController);
router.get("/:id", authenticateToken, getDoctorByIdController);
router.get("/profile/:userId", authenticateToken, getDoctorByUserIdController);

router.put(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  updateDoctorStatusController
);

export default router;
