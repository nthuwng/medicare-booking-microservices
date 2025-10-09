import { initCheckClinicConsumer } from "./checkClinic.consumer";
import { initCheckDoctorConsumer } from "./checkDoctor.consumer";
import { initCheckFullDetailDoctorConsumer } from "./checkFullDetailDoctor.consumer";
import { initGetDoctorIdByUserIdConsumer } from "./getDoctorIdByUserId.consumer";
import { initGetDoctorIdMessage } from "./getDoctorIdMessage";
import { initGetDoctorUserIdByDoctorIdConsumer } from "./getUserIdByDoctorId";
import { initCheckSpecialtyDoctorConsumer } from "./checkSpecialtyName.consumer";

export const initializeAllRabbitMQConsumers = async () => {
  try {
    await initCheckDoctorConsumer();
    await initCheckClinicConsumer();
    await initGetDoctorIdByUserIdConsumer();
    await initGetDoctorUserIdByDoctorIdConsumer();
    await initCheckFullDetailDoctorConsumer();
    await initGetDoctorIdMessage();
    await initCheckSpecialtyDoctorConsumer();

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
