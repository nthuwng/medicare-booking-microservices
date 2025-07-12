
import { checkDoctorInfor } from "src/services/doctorServices";
import { getChannel } from "../connection";

// Khởi tạo consumer để lắng nghe queue "auth.get_user"
export const initCheckDoctorConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("doctor.check_doctor", { durable: false });

  channel.consume("doctor.check_doctor", async (msg) => {
    if (!msg) return;

    try {
      const { doctorId } = JSON.parse(msg.content.toString());
      const doctor = await checkDoctorInfor(doctorId);

      // Gửi phản hồi đến queue được chỉ định trong `replyTo`
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify({ doctor })),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing auth.check_patient:", err);
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
