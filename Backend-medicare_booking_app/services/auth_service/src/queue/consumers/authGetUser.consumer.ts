import { prisma } from "../../config/client";
import { handleGetUserById } from "../../services/auth.services";
import { getChannel } from "../connection";

// Khởi tạo consumer để lắng nghe queue "auth.get_user"
export const initAuthGetUserConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("auth.get_user", { durable: false });

  channel.consume("auth.get_user", async (msg) => {
    if (!msg) return;

    try {
      const { userId } = JSON.parse(msg.content.toString());

      const user = await handleGetUserById(userId);

      // Gửi phản hồi đến queue được chỉ định trong `replyTo`
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(user || {})),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing auth.get_user:", err);
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
