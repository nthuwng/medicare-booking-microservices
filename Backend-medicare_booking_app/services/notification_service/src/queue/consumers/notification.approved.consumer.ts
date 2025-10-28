// src/queue/consumers/notification.approved.consumer.ts
import { handleCreateNotification } from "src/services/notificationServices";
import { getChannel } from "../connection";
import { getIO } from "src/socket";
import { getUserByIdViaRabbitMQ } from "../publishers/notification.publisher";

interface DoctorEventPayload {
  userId: string;
  doctorId: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  approvalStatus: "Approved" | "Rejected" | "Pending";
  occurredAt?: string;
  event?: string; // "doctor.approved"
}

export const initDoctorApprovedConsumer = async () => {
  const channel = getChannel();
  const exchangeName = "doctor.exchange";
  const queueName = "notification.doctor.approved";

  await channel.assertExchange(exchangeName, "topic", { durable: true });
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, exchangeName, "doctor.approved");

  channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      const payload: DoctorEventPayload = JSON.parse(msg.content.toString());
      if (!payload.userId || !payload.doctorId) {
        console.warn("[Notification] Invalid payload (approved):", payload);
        channel.ack(msg);
        return;
      }

      const user = await getUserByIdViaRabbitMQ(payload.userId);

      // Lưu notification cho chính doctor đó
      const notification = await handleCreateNotification({
        userId: payload.userId, // người nhận là bác sĩ
        type: "DOCTOR_APPROVED",
        title: "Tài khoản bác sĩ đã được duyệt",
        message: `Chúc mừng ${payload.fullName}, hồ sơ bác sĩ của bạn đã được phê duyệt.`,
        data: {
          doctorId: payload.doctorId,
          email: user?.email ?? "",
          phone: payload.phone ?? "",
          approvalStatus: payload.approvalStatus,
          doctorName: payload.fullName,
          avatarUrl: payload.avatarUrl ?? "",
          occurredAt: payload.occurredAt ?? new Date().toISOString(),
        },
      });

      // Gửi realtime đúng user
      const io = getIO();

      const dto = {
        id: notification.id,
        type: "DOCTOR_APPROVED",
      };

      io.to(`user:${payload.userId}`).emit("doctor.approved", {
        notification: dto,
      });

      channel.ack(msg);
    } catch (err) {
      console.error("[Notification] Error handling doctor.approved:", err);
      channel.nack(msg, false, false);
    }
  });
};
