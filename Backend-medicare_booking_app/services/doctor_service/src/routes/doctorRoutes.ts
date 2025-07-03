import express, { Express } from "express";
import {
  createDoctorController,
  getDoctorByIdController,
  updateDoctorStatusController,
  addDoctorSpecialtyController,
  removeDoctorSpecialtyController,
  addDoctorClinicController,
  removeDoctorClinicController,
  getDoctorsBySpecialtyController,
  getDoctorsByClinicController,
} from "../controller/doctorController";
import {
  authenticateToken,
  authorizeAdmin,
} from "src/middleware/auth.middleware";

const router = express.Router();

const doctorRoutes = (app: Express) => {
  // Basic doctor operations
  router.post("/", authenticateToken, createDoctorController);
  router.get("/:id", authenticateToken, getDoctorByIdController);
  router.put(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    updateDoctorStatusController
  );

  // Doctor-Specialty relationship management
  router.post(
    "/:doctorId/specialties",
    authenticateToken,
    authorizeAdmin,
    addDoctorSpecialtyController
  );
  router.delete(
    "/:doctorId/specialties/:specialtyId",
    authenticateToken,
    authorizeAdmin,
    removeDoctorSpecialtyController
  );

  // Doctor-Clinic relationship management
  router.post(
    "/:doctorId/clinics",
    authenticateToken,
    authorizeAdmin,
    addDoctorClinicController
  );
  router.delete(
    "/:doctorId/clinics/:clinicId",
    authenticateToken,
    authorizeAdmin,
    removeDoctorClinicController
  );

  // Get doctors by specialty or clinic
  router.get("/by-specialty/:specialtyId", getDoctorsBySpecialtyController);
  router.get("/by-clinic/:clinicId", getDoctorsByClinicController);

  app.use("/", router);
};

export default doctorRoutes;
