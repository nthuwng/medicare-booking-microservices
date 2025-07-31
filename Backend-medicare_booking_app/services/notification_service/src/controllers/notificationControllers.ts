import { Request, Response } from "express";
import {
  handleCreateNotification,
  handleGetNotification,
  handleMarkAsRead,
} from "src/services/notificationServices";

const createNotificationAPI = async (req: Request, res: Response) => {
  try {
    const { userId, title, message, data } = req.body;
    await handleCreateNotification({
      userId,
      type: "DOCTOR_REGISTRATION",
      title,
      message,
      data: data as any,
    });
    res.status(200).json({ message: "Notification created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getNotificationAPI = async (req: Request, res: Response) => {
  try {
    const notifications = await handleGetNotification();
    if (!notifications) {
      res.status(404).json({
        success: false,
        message: "No notifications found",
        data: [],
      });
      return;
    }
    res.status(200).json({
      success: true,
      length: notifications.length,
      message: "Get notifications successfully",
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const markAsReadAPI = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await handleMarkAsRead(id);
    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Thông báo không tồn tại.",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Thông báo đã đọc thành công.",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export { createNotificationAPI, getNotificationAPI, markAsReadAPI };
