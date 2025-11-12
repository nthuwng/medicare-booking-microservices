import { createPaymentDefaultConsumer } from "./createPaymentDefault";
import { getPaymentByAppointmentIdConsumer } from "./getPaymentByAppointmentId";
import { initUpdateCancelPaymentByAppointmentIdConsumer } from "./updateCancelPaymentByAppointmentId";

export const initializeAllRabbitMQConsumers = async () => {
  try {
    await getPaymentByAppointmentIdConsumer();
    await initUpdateCancelPaymentByAppointmentIdConsumer();
    await createPaymentDefaultConsumer();

    console.log(
      "✅ All RabbitMQ consumers payment_service initialized successfully."
    );
  } catch (error) {
    console.error(
      "❌ Failed to initialize one or more RabbitMQ consumers:",
      error
    );
    throw error;
  }
};
