import express, { Express } from "express";
import {
  createAppointmentController,
  getAppointmentsByUserController,
  getAllAppointmentsByDoctorIdController,
  updateAppointmentStatusController,
  getAppointmentByIdController,
  cancelAppointmentController
} from "src/controller/appointment.controllers";
import {
  authenticateToken,
  authorizePatient,
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

  router.put(
    "/update-appointment-status/:id",
    authorizeDoctor,
    updateAppointmentStatusController
  );

  router.get(
    "/my-appointments",
    authorizePatient,
    getAppointmentsByUserController
  );

  router.get(
    "/my-appointments/:id",
    authorizePatient,
    getAppointmentByIdController
  );

  router.put(
    "/cancel-appointment/:id",
    authorizePatient,
    cancelAppointmentController
  );

  app.use("/appointments", authenticateToken, router);
};

export default appointmentRoutes;
