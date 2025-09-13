import { updateAppointmentPaymentStatus } from "src/repository/appointment.repo";
import { getChannel } from "../connection";

// Khởi tạo consumer để lắng nghe queue "auth.get_user"
export const updateStatusAppointmentConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("appointment.update_payment_status", {
    durable: false,
  });

  channel.consume("appointment.update_payment_status", async (msg) => {
    if (!msg) return;

    try {
      const { appointmentId } = JSON.parse(msg.content.toString());
      await updateAppointmentPaymentStatus(appointmentId);

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing appointment.update_payment_status:", err);
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
