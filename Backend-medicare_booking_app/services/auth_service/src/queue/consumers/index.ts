import { initAuthCheckAdminConsumer } from "./authCheckAdmin.consumer";
import { initAuthCheckDoctorConsumer } from "./authCheckDoctor.consumer";
import { initAuthCheckPatientConsumer } from "./authCheckPatient.consumer";
import { initAuthGetAllUserConsumer } from "./authGetAllUser.consumer";
import { initAuthGetUserConsumer } from "./authGetUser.consumer";
import { initAuthVerifyTokenConsumer } from "./authVerifyToken.consumer";

export const initializeAllRabbitMQConsumers = async () => {
  try {
    await initAuthGetUserConsumer();
    await initAuthVerifyTokenConsumer();
    await initAuthCheckAdminConsumer();
    await initAuthGetAllUserConsumer();
    await initAuthCheckPatientConsumer();
    await initAuthCheckDoctorConsumer();

    console.log("✅ All RabbitMQ consumers auth_service initialized successfully.");
  } catch (error) {
    console.error(
      "❌ Failed to initialize one or more RabbitMQ consumers:",
      error
    );
    throw error;
  }
};
