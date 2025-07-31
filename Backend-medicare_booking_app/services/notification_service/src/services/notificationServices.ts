import { CreateClinicProfileData } from "@shared/index";
import { CreateNotificationData } from "@shared/interfaces/notification";
import { prisma } from "src/config/client";

const handleCreateNotification = async (data: CreateNotificationData) => {
  const notification = await prisma.notification.create({
    data: {
      type: data.type,
      userId: data.userId,
      title: data.title,
      message: data.message,
      data: data as any,
    },
  });

  return notification;
};

const handleGetNotification = async () => {
  const notifications = await prisma.notification.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return notifications;
};

const handleMarkAsRead = async (notificationId: string) => {
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
  return notification;
};

export { handleCreateNotification, handleGetNotification, handleMarkAsRead };
