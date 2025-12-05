import { getChannel } from "../connection";
import { sendEmailOTPRegister } from "src/services/sendEmailRegister.service";

export const initSendEmailRegisterConsumer = async () => {
  const channel = getChannel();
  const exchangeName = "auth.exchange";
  const queueName = "auth.register";

  await channel.assertExchange(exchangeName, "topic", { durable: true });
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, exchangeName, "auth.register");
  channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      const payload = JSON.parse(msg.content.toString());

      await sendEmailOTPRegister(payload.email, payload.otp);

      channel.ack(msg);
    } catch (err) {
      console.error("[Notification] Error handling auth.forgot_password:", err);
      // tránh requeue vô hạn; nếu có DLX thì nack requeue=false sẽ đẩy sang DLQ
      channel.nack(msg, false, false);
    }
  });
};
