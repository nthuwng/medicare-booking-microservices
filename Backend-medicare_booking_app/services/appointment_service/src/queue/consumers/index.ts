import { updateStatusAppointmentConsumer } from "./updateStatusAppointment";

export const initializeAllRabbitMQConsumers = async () => {
  try {
    await updateStatusAppointmentConsumer();

    console.log(
      "✅ All RabbitMQ consumers appointment_service initialized successfully."
    );
  } catch (error) {
    console.error(
      "❌ Failed to initialize one or more RabbitMQ consumers:",
      error
    );
    throw error;
  }
};
