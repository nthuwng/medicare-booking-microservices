import { initCheckScheduleConsumer } from "./checkSchedule.consumer";
import { initGetScheduleByDoctorIdConsumer } from "./getScheduleByDoctorId.consumer";
import { initUpdateTimeSlotConsumer } from "./updateTimeSlot.consumer";

export const initializeAllRabbitMQConsumers = async () => {
  try {
    await initCheckScheduleConsumer();
    await initGetScheduleByDoctorIdConsumer();
    await initUpdateTimeSlotConsumer();
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
