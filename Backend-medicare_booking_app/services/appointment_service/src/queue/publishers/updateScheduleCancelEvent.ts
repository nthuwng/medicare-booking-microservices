import { getChannel } from "../connection";

export const publishUpdateCancelScheduleAndTimeSlotId = async (
  scheduleId: string,
  timeSlotId: string
) => {
  const channel = getChannel();

  await channel.assertQueue("schedule.update_cancel_schedule_and_timeslot_id", { durable: false });

  channel.sendToQueue(
    "schedule.update_cancel_schedule_and_timeslot_id",
    Buffer.from(JSON.stringify({ scheduleId, timeSlotId }))
  );
};
