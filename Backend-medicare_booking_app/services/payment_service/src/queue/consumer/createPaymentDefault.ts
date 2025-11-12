
import { createPaymentDefault } from "src/repository/payment";
import { getChannel } from "../connection";

// Khởi tạo consumer để lắng nghe queue "auth.get_user"
export const createPaymentDefaultConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("payment.create_payment_default", {
    durable: false,
  });

  channel.consume("payment.create_payment_default", async (msg) => {
    if (!msg) return;

    try {
      const { appointmentId, totalFee } = JSON.parse(msg.content.toString());
      await createPaymentDefault(appointmentId, totalFee);

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing payment.create_payment_default:", err);
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
