// src/queue/consumers/notification.approved.consumer.ts
import { handleCreateNotification } from "src/services/notificationServices";
import { getChannel } from "../connection";
import { getIO } from "src/socket";
import { getUserByIdViaRabbitMQ } from "../publishers/notification.publisher";
import { sendAppointmentCreatedEmail } from "src/services/email.service";

interface AppointmentEventPayload {
  appointmentId: string;
  doctorId: string;
  userId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  appointmentDateTime: string;
  reason: string;
  totalFee: number;
}

export const initNotificationAppointmentConsumer = async () => {
  const channel = getChannel();
  const exchangeName = "appointment.exchange.client_to_doctor";
  const queueName = "notification.appointment.created";

  await channel.assertExchange(exchangeName, "topic", { durable: true });
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, exchangeName, "appointment.created");

  channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      const payload: AppointmentEventPayload = JSON.parse(
        msg.content.toString()
      );
      if (!payload.userId || !payload.appointmentId) {
        console.warn("[Notification] Invalid payload (appointment):", payload);
        channel.ack(msg);
        return;
      }

      const user = await getUserByIdViaRabbitMQ(payload.userId);

      await sendAppointmentCreatedEmail(payload.patientEmail, {
        appointmentId: payload.appointmentId,
        patientName: payload.patientName,
        patientPhone: payload.patientPhone,
        appointmentDateTime: payload.appointmentDateTime,
        reason: payload.reason,
        totalFee: payload.totalFee,
      });

      // Lưu notification cho chính doctor đó
      const notification = await handleCreateNotification({
        userId: payload.userId, // người nhận là bác sĩ
        type: "APPOINTMENT_CREATED",
        title: "Có một lịch hẹn mới",
        message: `${payload.patientName} đã đặt lịch hẹn với bạn`,
        data: {
          appointmentId: payload.appointmentId,
          doctorId: payload.doctorId,
          userId: user?.id,
          patientName: payload.patientName,
          patientPhone: payload.patientPhone,
          appointmentDateTime: payload.appointmentDateTime,
          reason: payload.reason,
          totalFee: payload.totalFee,
        },
      });

      // Gửi realtime đúng user
      const io = getIO();

      const dto = {
        id: notification.id,
        type: "APPOINTMENT_CREATED",
      };

      io.to(`user:${payload.userId}`).emit("appointment.created", {
        notification: dto,
      });

      channel.ack(msg);
    } catch (err) {
      console.error("[Notification] Error handling appointment.created:", err);
      channel.nack(msg, false, false);
    }
  });
};
