import express, { Express } from "express";
import {
  createPatientController,
  getPatientByIdController,
  getAllPatientController,
  deletePatientController,
  getPatientByUserIdController,
} from "../controllers/patient.controller";
import {
  authenticateToken,
  authorizeAdmin,
} from "src/middleware/auth.middleware";

const router = express.Router();

const patientRoutes = (app: Express) => {
  router.post("/", authenticateToken, createPatientController);
  router.get("/:id", authenticateToken, getPatientByIdController);
  router.get("/by-user-id/:userId", authenticateToken, getPatientByUserIdController);
  router.get("/", authenticateToken, authorizeAdmin, getAllPatientController);
  router.delete(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    deletePatientController
  );

  app.use("/patients", router);
};

export default patientRoutes;
