

import { getScheduleById } from "src/services/scheduleServices";
import { getChannel } from "../connection";

// Khởi tạo consumer để lắng nghe queue "auth.get_user"
export const initCheckScheduleConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("schedule.check_schedule", { durable: false });

  channel.consume("schedule.check_schedule", async (msg) => {
    if (!msg) return;

    try {
      const { scheduleId } = JSON.parse(msg.content.toString());
      const schedule = await getScheduleById(scheduleId);
      // Gửi phản hồi đến queue được chỉ định trong `replyTo`
      // const isAvailable = schedule?.isAvailable === true;
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify({ ...schedule })),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing schedule.check_schedule:", err);
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
