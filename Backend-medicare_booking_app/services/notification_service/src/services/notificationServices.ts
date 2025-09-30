import { CreateClinicProfileData } from "@shared/index";
import { CreateNotificationData } from "@shared/interfaces/notification";
import { prisma } from "src/config/client";
import { getUserByIdViaRabbitMQ } from "src/queue/publishers/notification.publisher";

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

const handleGetNotificationByUserId = async (userId: string) => {
  const user = await getUserByIdViaRabbitMQ(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  });
  return notifications;
};

const handleMarkAsReadAll = async (userId: string) => {
  const notification = await prisma.notification.updateMany({
    where: { userId },
    data: { read: true },
  });
  return notification;
};

const handleDeleteAll = async (userId: string) => {
  const notification = await prisma.notification.deleteMany({
    where: { userId },
  });
  return notification;
};

export {
  handleCreateNotification,
  handleGetNotification,
  handleMarkAsRead,
  handleGetNotificationByUserId,
  handleMarkAsReadAll,
  handleDeleteAll,
};
