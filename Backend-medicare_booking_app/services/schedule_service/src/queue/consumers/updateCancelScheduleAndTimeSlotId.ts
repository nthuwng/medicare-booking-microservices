import { updateCancelTimeSlotByScheduleIdAndTimeSlotId, updateTimeSlotByScheduleIdAndTimeSlotId } from "src/repository/schedule.repo";
import { getChannel } from "../connection";

// Khởi tạo consumer để lắng nghe queue "auth.get_user"
export const initUpdateCancelScheduleAndTimeSlotIdConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("schedule.update_cancel_schedule_and_timeslot_id", { durable: false });

  channel.consume("schedule.update_cancel_schedule_and_timeslot_id", async (msg) => {
    if (!msg) return;

    try {
      const { scheduleId, timeSlotId } = JSON.parse(msg.content.toString());
      await updateCancelTimeSlotByScheduleIdAndTimeSlotId(scheduleId, timeSlotId);

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing schedule.update_cancel_schedule_and_timeslot_id:", err);
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
