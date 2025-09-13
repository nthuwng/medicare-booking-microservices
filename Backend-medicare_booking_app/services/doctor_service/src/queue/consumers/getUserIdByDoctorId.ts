import { getUserIdByDoctorIdService } from "src/services/doctorServices";
import { getChannel } from "../connection";

// Khởi tạo consumer để lắng nghe queue "auth.get_user"
export const initGetDoctorUserIdByDoctorIdConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("doctor.get_doctor_user_id_by_doctor_id", {
    durable: false,
  });

  channel.consume("doctor.get_doctor_user_id_by_doctor_id", async (msg) => {
    if (!msg) return;

    try {
      const { doctorId } = JSON.parse(msg.content.toString());
      const doctor = await getUserIdByDoctorIdService(doctorId);

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(doctor)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing doctor.check_doctor_profile:", err);
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
