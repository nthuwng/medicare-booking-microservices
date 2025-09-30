import express, { Express } from "express";
import {
  createNotificationAPI,
  getNotificationAPI,
  getNotificationByUserIdAPI,
  markAsReadAPI,
  markAsReadAllAPI,
  deleteAllAPI,
} from "src/controllers/notificationControllers";
import { authenticateToken } from "src/middlewares/auth.middleware";

const router = express.Router();

const notificationRoutes = (app: Express) => {
  router.post("/create-notification", authenticateToken, createNotificationAPI);

  router.get("/get-notification", authenticateToken, getNotificationAPI);
  router.get(
    "/get-notification-by-user-id/:userId",
    authenticateToken,
    getNotificationByUserIdAPI
  );
  router.put("/mark-as-read/:id", authenticateToken, markAsReadAPI);
  router.put("/mark-as-read-all/:userId", authenticateToken, markAsReadAllAPI);
  router.delete("/delete-all/:userId", authenticateToken, deleteAllAPI);
  app.use("/", router);
};

export default notificationRoutes;
