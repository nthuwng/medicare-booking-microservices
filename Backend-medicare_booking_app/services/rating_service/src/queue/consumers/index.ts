import { initGetRatingByDoctorIdConsumer } from "./getRatingByDoctorId.consumer";
import { initGetRatingStatsByDoctorIdConsumer } from "./getFullRating.consumer";

export const initializeAllRabbitMQConsumers = async () => {
  try {
    await initGetRatingByDoctorIdConsumer();
    await initGetRatingStatsByDoctorIdConsumer();

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
