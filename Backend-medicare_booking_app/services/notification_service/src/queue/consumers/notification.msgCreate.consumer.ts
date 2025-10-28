// src/queue/consumers/notification.approved.consumer.ts
import { handleCreateNotification } from "src/services/notificationServices";
import { getChannel } from "../connection";
import { getIO } from "src/socket";
import {
  getPatientByIdViaRabbitMQ,
  getUserByIdViaRabbitMQ,
} from "../publishers/notification.publisher";

interface MessageEventPayload {
  patientId: string;
  doctorUserId: string;
}

export const initNotificationMsgCreateConsumer = async () => {
  const channel = getChannel();
  const exchangeName = "message.exchange";
  const queueName = "notification.message.created";

  await channel.assertExchange(exchangeName, "topic", { durable: true });
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, exchangeName, "message.created");

  channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      const payload: MessageEventPayload = JSON.parse(msg.content.toString());

      if (!payload.patientId || !payload.doctorUserId) {
        console.warn(
          "[Notification] Invalid payload (message.created):",
          payload
        );
        channel.ack(msg);
        return;
      }

      const patient = await getPatientByIdViaRabbitMQ(payload.patientId);

      // Lưu notification cho chính doctor đó
      const notification = await handleCreateNotification({
        userId: payload.doctorUserId, // người nhận là bác sĩ
        type: "MESSAGE_CREATED",
        title: "Bạn có một tin nhắn mới",
        message: `Bạn có một tin nhắn mới từ ${patient?.full_name}. Hãy xem ngay.`,
        data: {
          patientId: payload.patientId,
          patientName: patient?.full_name,
          patientAvatar: patient?.avatar_url,
          doctorUserId: payload.doctorUserId,
        },
      });

      // Gửi realtime đúng user
      const io = getIO();

      const dto = {
        id: notification.id,
        type: "MESSAGE_CREATED",
      };

      io.to(`user:${payload.doctorUserId}`).emit("message.created", {
        notification: dto,
      });

      channel.ack(msg);
    } catch (err) {
      console.error("[Notification] Error handling message.created:", err);
      channel.nack(msg, false, false);
    }
  });
};
