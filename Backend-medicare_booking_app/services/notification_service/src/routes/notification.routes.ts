import express, { Express } from "express";
import {
  createNotificationAPI,
  getNotificationAPI,
  markAsReadAPI
} from "src/controllers/notificationControllers";
import { authenticateToken } from "src/middlewares/auth.middleware";

const router = express.Router();

const notificationRoutes = (app: Express) => {
  router.post("/create-notification", authenticateToken, createNotificationAPI);

  router.get("/get-notification", authenticateToken, getNotificationAPI);
  router.put("/mark-as-read/:id", authenticateToken, markAsReadAPI);
  app.use("/", router);
};

export default notificationRoutes;
