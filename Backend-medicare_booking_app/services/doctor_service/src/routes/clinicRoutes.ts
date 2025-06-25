import express, { Express } from "express";
import { createClinicController } from "src/controller/clinicController";

import { authenticateToken, authorizeAdmin } from "src/middleware/auth.middleware";

const router = express.Router();

const clinicRoutes = (app: Express) => {
  router.post("/", createClinicController);

  app.use("/clinic",authenticateToken,authorizeAdmin, router);
};

export default clinicRoutes;
