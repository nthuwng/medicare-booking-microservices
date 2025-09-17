import { getChannel } from "../connection";
import { getDoctorProfileBasicInfo } from "src/repository/doctor.repo";

// Khởi tạo consumer để lắng nghe queue "auth.get_user"
export const initCheckDoctorConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("doctor.check_doctor_profile", { durable: false });

  channel.consume("doctor.check_doctor_profile", async (msg) => {
    if (!msg) return;

    try {
      const { doctorId } = JSON.parse(msg.content.toString());

      const doctor = await getDoctorProfileBasicInfo(doctorId);

      const isApproved = doctor?.approvalStatus === "Approved";
      const responseData = doctor ? { ...doctor, isApproved } : null;

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(responseData)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    } catch (err) {
      console.error("❌ Error processing doctor.check_doctor_profile:", err);

      // Gửi phản hồi null thay vì nack để tránh timeout
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(null)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    }
  });
};
