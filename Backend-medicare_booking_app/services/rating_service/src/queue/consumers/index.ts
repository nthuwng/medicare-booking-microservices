import { initGetRatingByDoctorIdConsumer } from "./getRatingByDoctorId.consumer";


export const initializeAllRabbitMQConsumers = async () => {
  try {
    await initGetRatingByDoctorIdConsumer();


    console.log(
      "✅ All RabbitMQ consumers rating_service initialized successfully."
    );
  } catch (error) {
    console.error(
      "❌ Failed to initialize one or more RabbitMQ consumers:",
      error
    );
    throw error;
  }
};
