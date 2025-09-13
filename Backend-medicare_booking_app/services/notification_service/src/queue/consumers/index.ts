import { initNotificationAppointmentConsumer } from "./notification.appointment.consumer";
import { initDoctorApprovedConsumer } from "./notification.approved.consumer";
import { initDoctorRegisteredConsumer } from "./notification.registered.consumer";

export const initializeAllRabbitMQConsumers = async () => {
  try {
    await initDoctorRegisteredConsumer();
    await initDoctorApprovedConsumer();
    await initNotificationAppointmentConsumer();
    console.log(
      "✅ All RabbitMQ consumers notification_service initialized successfully."
    );
  } catch (error) {
    console.error(
      "❌ Failed to initialize one or more RabbitMQ consumers:",
      error
    );
    throw error;
  }
};
