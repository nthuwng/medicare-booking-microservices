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

  // Public/shared routes (need auth but any role)
  router.get("/appointments/:id", getAppointmentByIdController);

  // Admin only routes - update appointment status
  router.patch(
    "/appointments/:id/status",
    authorizeAdmin,
    updateAppointmentStatusController
  );

  app.use("/", authenticateToken, router);
};

export default appointmentRoutes;
