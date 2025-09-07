import { getChannel } from "../connection";

export const publishUpdateTimeSlot = async (
  scheduleId: string,
  timeSlotId: string
) => {
  const channel = getChannel();

  await channel.assertQueue("schedule.update_time_slot", { durable: false });

  channel.sendToQueue(
    "schedule.update_time_slot",
    Buffer.from(JSON.stringify({ scheduleId, timeSlotId }))
  );
};
