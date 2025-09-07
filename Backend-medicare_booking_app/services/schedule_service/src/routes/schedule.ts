import express, { Express } from "express";
import {
  createScheduleController,
  getAllScheduleController,
  getScheduleByDoctorIdController,
  getScheduleByIdController,
  updateExpiredTimeSlotsController,
  getScheduleByScheduleIdController
} from "src/controller/scheduleController";
import {
  authenticateToken,
  authorizeAdmin,
  authorizeDoctor,
} from "src/middleware/auth.middleware";

const router = express.Router();

const scheduleRoutes = (app: Express) => {
  router.post(
    "/",
    authenticateToken,
    authorizeDoctor,
    createScheduleController
  );
  router.get("/", authenticateToken, authorizeAdmin, getAllScheduleController);

  router.get(
    "/:id",
    authenticateToken,
    getScheduleByIdController
  );

  router.get(
    "/by-doctorId/:userId",
    authenticateToken,
    authorizeDoctor,
    getScheduleByDoctorIdController
  );

  // API để cập nhật time slots hết hạn
  router.patch(
    "/update-expired",
    authenticateToken,
    updateExpiredTimeSlotsController
  );

  router.get(
    "/by-scheduleId/:scheduleId",
    authenticateToken,
    getScheduleByScheduleIdController
  );

  app.use("/schedules", router);
};

export default scheduleRoutes;
