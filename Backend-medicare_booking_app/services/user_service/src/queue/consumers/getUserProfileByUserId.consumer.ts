import { getUserProfileByUserId } from "src/repository/patient.repo";
import { getChannel } from "../connection";

export const initGetUserProfileByUserIdConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("user.getUserProfileByUserId", { durable: false });

  channel.consume("user.getUserProfileByUserId", async (msg) => {
    if (!msg) return;

    try {
      const { userId } = JSON.parse(msg.content.toString());

      const userProfile = await getUserProfileByUserId(userId);

      // Gửi phản hồi đến queue được chỉ định trong `replyTo`
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(userProfile)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    } catch (err) {
      // Gửi phản hồi null thay vì nack để tránh timeout
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(null)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    }
  });
};
