import { initNotificationAppointmentConsumer } from "./notification.appointment.consumer";
import { initDoctorApprovedConsumer } from "./notification.approved.consumer";
import { initDoctorRegisteredConsumer } from "./notification.registered.consumer";
import { initNotificationMsgCreateConsumer } from "./notification.msgCreate.consumer";
import { initSendEmailConsumer } from "./sendEmail.consumer";
import { initSendPasswordToEmailConsumer } from "./sendPasswordToEmail.consumer";
import { initSendEmailRegisterConsumer } from "./sendEmailRegister.consumer";

export const initializeAllRabbitMQConsumers = async () => {
  try {
    await initDoctorRegisteredConsumer();
    await initDoctorApprovedConsumer();
    await initNotificationAppointmentConsumer();
    await initNotificationMsgCreateConsumer();
    await initSendEmailConsumer();
    await initSendPasswordToEmailConsumer();
    await initSendEmailRegisterConsumer();
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
