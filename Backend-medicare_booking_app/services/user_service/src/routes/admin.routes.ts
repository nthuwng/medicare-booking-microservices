import express, { Express } from "express";
import {
  createAdminController,
  getAdminByIdController,
  getAllAdmintController,
  deleteAdminController
} from "../controllers/admin.controller";
import {
  authenticateToken,
  authorizeAdmin,
} from "src/middleware/auth.middleware";

const router = express.Router();

const adminRoutes = (app: Express) => {
  router.post("/", authenticateToken, authorizeAdmin, createAdminController);
  router.get("/:id", authenticateToken,authorizeAdmin, getAdminByIdController);
  router.get("/", authenticateToken, authorizeAdmin, getAllAdmintController);
  router.delete("/:id", authenticateToken, authorizeAdmin, deleteAdminController);


  app.use("/admins", router);
};

export default adminRoutes;
