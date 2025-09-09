import express, { Express } from "express";
import {
  createAppointmentController,
  getAppointmentsByUserController,
  getAllAppointmentsByDoctorIdController,
} from "src/controller/appointment.controllers";
import {
  authenticateToken,
  authorizePatient,
  authorizeAdmin,
  authorizeDoctor,
} from "src/middleware/auth.middleware";

const router = express.Router();

const appointmentRoutes = (app: Express) => {
  // Patient routes
  router.post(
    "/create-appointment",
    authorizePatient,
    createAppointmentController
  );

  router.get(
    "/doctor-appointments/:userId",
    authorizeDoctor,
    getAllAppointmentsByDoctorIdController
  );

  router.get(
    "/my-appointments",
    authorizePatient,
    getAppointmentsByUserController
  );

  app.use("/appointments", authenticateToken, router);
};

export default appointmentRoutes;
