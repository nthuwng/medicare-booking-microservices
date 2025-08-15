// src/queue/consumers/notification.registered.consumer.ts
import { handleCreateNotification } from "src/services/notificationServices";
import { getChannel } from "../connection";
import { getIO } from "src/socket";
import { getUserByIdViaRabbitMQ } from "../publishers/notification.publisher";

interface DoctorEventPayload {
  userId: string;
  doctorId: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;       // đổi về camelCase cho thống nhất
  approvalStatus: string;   // "Pending" khi mới đăng ký
  occurredAt?: string;
  event?: string;           // "doctor.registered"
}

export const initDoctorRegisteredConsumer = async () => {
  const channel = getChannel();
  const exchangeName = "doctor.exchange";
  const queueName = "notification.doctor.registered";

  await channel.assertExchange(exchangeName, "topic", { durable: true });
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, exchangeName, "doctor.registered");

  console.log(`[Notification] Waiting on ${queueName}...`);

  channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      const payload: DoctorEventPayload = JSON.parse(msg.content.toString());
      if (!payload.userId || !payload.doctorId) {
        console.warn("[Notification] Invalid payload (registered):", payload);
        channel.ack(msg); // ack để không lặp vô tận
        return;
      }

      const user = await getUserByIdViaRabbitMQ(payload.userId);

      // Lưu notification (cho admin, tuỳ bạn dùng userId = 'admin' hay 1 bảng roles)
      const notification = await handleCreateNotification({
        userId: "admin", // hoặc lưu theo từng admin nếu có mapping
        type: "DOCTOR_REGISTRATION",
        title: "Đăng ký bác sĩ mới - Chờ phê duyệt",
        message: `Bác sĩ ${payload.fullName} đăng ký tài khoản mới. SĐT: ${payload.phone ?? ""}, Email: ${user?.email ?? ""}`,
        data: {
          doctorId: payload.doctorId,
          doctorUserId: payload.userId,
          email: user?.email ?? "",
          phone: payload.phone ?? "",
          approvalStatus: payload.approvalStatus,
          avatarUrl: payload.avatarUrl ?? "",
          occurredAt: payload.occurredAt ?? new Date().toISOString(),
        },
      });

      // Broadcast cho tất cả admin đang online
      const io = getIO();
      const dto = {
        id: notification.id,
        type: "DOCTOR_REGISTRATION",
      };

      io.to("admins").emit("doctor.registered", { notification: dto });

      channel.ack(msg);
    } catch (err) {
      console.error("[Notification] Error handling doctor.registered:", err);
      // tránh requeue vô hạn; nếu có DLX thì nack requeue=false sẽ đẩy sang DLQ
      channel.nack(msg, false, false);
    }
  });
};
