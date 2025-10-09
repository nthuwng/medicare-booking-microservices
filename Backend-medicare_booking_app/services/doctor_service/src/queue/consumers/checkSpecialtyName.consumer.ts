import { handleSpecialtyDoctorCheck } from "src/services/doctorServices";
import { getChannel } from "../connection";
import { handleSpecialtyDoctorCheckViaRepository } from "src/repository/doctor.repo";

// Khởi tạo consumer để lắng nghe queue "auth.get_user"
export const initCheckSpecialtyDoctorConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("doctor.check_specialty_doctor", {
    durable: false,
  });

  channel.consume("doctor.check_specialty_doctor", async (msg) => {
    if (!msg) return;

    try {
      const { specialtyName } = JSON.parse(msg.content.toString());
      const doctor = await handleSpecialtyDoctorCheckViaRepository(specialtyName);

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(doctor)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing doctor.check_specialty_doctor:", err);
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
