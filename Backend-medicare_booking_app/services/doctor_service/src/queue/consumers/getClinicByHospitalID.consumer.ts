import { getChannel } from "../connection";
import { getClinicByHospitalId } from "src/repository/doctor.repo";

// Khởi tạo consumer để lắng nghe queue "auth.get_user"
export const initGetClinicByHospitalIdConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("doctor.get_clinic_by_hospital_id", {
    durable: false,
  });

  channel.consume("doctor.get_clinic_by_hospital_id", async (msg) => {
    if (!msg) return;

    try {
      const { hospitalIds } = JSON.parse(msg.content.toString());
      const clinics = await getClinicByHospitalId(hospitalIds);

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(clinics)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing doctor.get_clinic_by_hospital_id:", err);
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
