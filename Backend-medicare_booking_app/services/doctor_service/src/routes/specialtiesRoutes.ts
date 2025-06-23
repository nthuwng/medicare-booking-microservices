import express, { Express } from "express";
import { createSpecialtiesController } from "src/controller/specialtiesController";
import { authenticateToken, authorizeAdmin } from "src/middleware/auth.middleware";

const router = express.Router();

const specialtiesRoutes = (app: Express) => {
  router.post("/", createSpecialtiesController);

  app.use("/specialties",authenticateToken,authorizeAdmin, router);
};

export default specialtiesRoutes;
