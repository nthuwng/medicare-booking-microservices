import { getPaymentByAppointmentId } from "src/repository/payment";
import { getChannel } from "../connection";

// Khởi tạo consumer để lắng nghe queue "auth.get_user"
export const getPaymentByAppointmentIdConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("payment.get_payment_by_appointment_id", {
    durable: false,
  });

  channel.consume("payment.get_payment_by_appointment_id", async (msg) => {
    if (!msg) return;

    try {
      const { appointmentId } = JSON.parse(msg.content.toString());
      const payment = await getPaymentByAppointmentId(appointmentId);

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(payment || null)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing payment.get_payment_by_appointment_id:", err);
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
