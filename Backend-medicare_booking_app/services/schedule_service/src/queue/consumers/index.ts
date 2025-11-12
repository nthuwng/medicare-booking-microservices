import { initCheckScheduleConsumer } from "./checkSchedule.consumer";
import { initGetScheduleByDoctorIdConsumer } from "./getScheduleByDoctorId.consumer";
import { initUpdateTimeSlotConsumer } from "./updateTimeSlot.consumer";
import { initCheckScheduleAndTimeslotIdConsumer } from "./checkScheduleAndTimeslotId";
import { initUpdateCancelScheduleAndTimeSlotIdConsumer } from "./updateCancelScheduleAndTimeSlotId";

export const initializeAllRabbitMQConsumers = async () => {
  try {
    await initCheckScheduleConsumer();
    await initGetScheduleByDoctorIdConsumer();
    await initUpdateTimeSlotConsumer();
    await initCheckScheduleAndTimeslotIdConsumer();
    await initUpdateCancelScheduleAndTimeSlotIdConsumer();
    console.log(
      "✅ All RabbitMQ consumers doctor_service initialized successfully."
    );
  } catch (error) {
    console.error(
      "❌ Failed to initialize one or more RabbitMQ consumers:",
      error
    );
    throw error;
  }
};
