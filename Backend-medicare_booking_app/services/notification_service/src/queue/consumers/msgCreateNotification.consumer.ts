import { handleCreateNotification } from "src/services/notificationServices";
import { getChannel } from "../connection";
import { getIO } from "src/socket";
import { getUserByIdViaRabbitMQ } from "../publishers/notification.publisher";

interface DoctorRegistrationPayload {
  userId: string;
  doctorId: string;
  fullName: string;
  phone: string;
  avatar_url: string;
  approvalStatus: string;
}

export const initCreateNotificationConsumer = async () => {
  const channel = getChannel();

  const exchangeName = "doctor.exchange";
  const queueName = "notification.doctor.registered";

  // Tạo exchange
  await channel.assertExchange(exchangeName, "fanout", { durable: false });

  // Tạo queue riêng cho notification service
  await channel.assertQueue(queueName, { durable: false });

  // Bind queue vào exchange
  await channel.bindQueue(queueName, exchangeName, "");

  console.log(
    `[Notification Consumer] Waiting for messages in queue: ${queueName}`
  );

  channel.consume(queueName, async (msg) => {
    if (!msg) return;

    try {
      const payload: DoctorRegistrationPayload = JSON.parse(
        msg.content.toString()
      );

      const user = await getUserByIdViaRabbitMQ(payload.userId);

      const notification = await handleCreateNotification({
        userId: "admin",
        type: "DOCTOR_REGISTRATION",
        title: "Đăng ký bác sĩ mới - Chờ phê duyệt",
        message: `Bác sĩ ${payload.fullName} đã đăng ký tài khoản mới.SĐT: ${payload.phone} Email: ${user.email}`,
        data: {
          doctorId: payload.doctorId,
          email: user.email,
          doctorUserId: payload.userId,
          approvalStatus: payload.approvalStatus,
          doctorName: payload.fullName,
          avatar_url: payload.avatar_url,
          phone: payload.phone,
          registrationTime: new Date().toISOString(),
        },
      });

      const io = getIO();
      io.to("admins").emit("doctorRegistration", {
        email: user.email,
        notificationId: notification.id,
        userId: payload.userId,
        doctorId: payload.doctorId,
        fullName: payload.fullName,
        phone: payload.phone,
      });

      console.log(
        `[Websocket Consumer] Successfully broadcasted doctor registration for ${payload.fullName}`
      );

      channel.ack(msg);
    } catch (err) {
      console.error(
        "Error processing doctor registration in notification service:",
        err
      );
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
