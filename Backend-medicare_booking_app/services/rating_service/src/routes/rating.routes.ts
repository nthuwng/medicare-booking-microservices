import express, { Express } from "express";
import {
  getRatingByIdController,
  createRatingController,
  getRatingByDoctorIdController,
  getTopRateDoctorsController,
} from "../controller/rating.controller";
import { authenticateToken } from "src/middlewares/auth.middleware";

const router = express.Router();

const ratingRoutes = (app: Express) => {
  router.get("/:id", authenticateToken, getRatingByIdController);
  router.get("/by-doctorId/:doctorId", authenticateToken, getRatingByDoctorIdController);
  router.post("/", authenticateToken, createRatingController);
  router.get("/top-rate/doctors", authenticateToken, getTopRateDoctorsController);
  app.use("/", router);
};

export default ratingRoutes;
