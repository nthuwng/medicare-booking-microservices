import { initCheckScheduleConsumer } from "./checkSchedule.consumer";

export const initializeAllRabbitMQConsumers = async () => {
  try {
    await initCheckScheduleConsumer();

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
