import { updateTimeSlotByScheduleIdAndTimeSlotId } from "src/repository/schedule.repo";
import { getChannel } from "../connection";

// Khởi tạo consumer để lắng nghe queue "auth.get_user"
export const initUpdateTimeSlotConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("schedule.update_time_slot", { durable: false });

  channel.consume("schedule.update_time_slot", async (msg) => {
    if (!msg) return;

    try {
      const { scheduleId, timeSlotId } = JSON.parse(msg.content.toString());
      await updateTimeSlotByScheduleIdAndTimeSlotId(scheduleId, timeSlotId);

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing schedule.update_time_slot:", err);
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
