import express, { Express } from "express";
import {
  createAppointmentController,
  getAppointmentsByUserController,
  getAppointmentByIdController,
  updateAppointmentStatusController,
} from "src/controller/appointment.controllers";
import {
  authenticateToken,
  authorizePatient,
  authorizeAdmin,
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
    "/my-appointments",
    authorizePatient,
    getAppointmentsByUserController
  );


  app.use("/", authenticateToken, router);
};

export default appointmentRoutes;
