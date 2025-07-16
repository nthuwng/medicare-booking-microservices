import express, { Express } from "express";
import {
  createScheduleController,
  getAllScheduleController,
  getScheduleByDoctorIdController,
  getScheduleByIdController,
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
  router.get("/:id", authenticateToken, authorizeAdmin, getScheduleByIdController);
  router.get(
    "/by-doctor/:doctorId",
    authenticateToken,
    authorizeDoctor,
    getScheduleByDoctorIdController
  );

  app.use("/schedules", router);
};

export default scheduleRoutes;
