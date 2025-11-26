import { getChannel } from "../connection";
import { createOneAdminProfile } from "src/repository/admin.repo";

export const initCreateOneAdminProfileConsumer = async () => {
  const channel = getChannel();
  const exchangeName = "auth.exchange";
  const queueName = "auth.create_one_admin_profile";

  await channel.assertExchange(exchangeName, "topic", { durable: true });
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(
    queueName,
    exchangeName,
    "auth.create_one_admin_profile"
  );

  channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      const { admin }: { admin: any } = JSON.parse(msg.content.toString());
      await createOneAdminProfile(admin);

      channel.ack(msg);
    } catch (err) {
      console.error(
        "[Auth] Error handling auth.create_one_admin_profile:",
        err
      );
      // tránh requeue vô hạn; nếu có DLX thì nack requeue=false sẽ đẩy sang DLQ
      channel.nack(msg, false, false);
    }
  });
};
