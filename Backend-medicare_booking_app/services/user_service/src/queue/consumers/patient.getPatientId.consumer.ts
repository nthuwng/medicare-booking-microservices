
import { getPatientById } from "src/repository/patient.repo";
import { getChannel } from "../connection";

export const initGetPatientIdConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("user.getPatientById", { durable: false });

  channel.consume("user.getPatientById", async (msg) => {
    if (!msg) return;

    try {
      const { patientId } = JSON.parse(msg.content.toString());
      const patient = await getPatientById(patientId);
      // Gửi phản hồi đến queue được chỉ định trong `replyTo`
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(patient || null)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing user.getPatientById:", err);
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
