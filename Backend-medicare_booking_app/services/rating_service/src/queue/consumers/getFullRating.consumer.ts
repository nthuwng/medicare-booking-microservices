import {
    getRatingStatsByDoctorId,
} from "src/repository/rating.repo";
import { getChannel } from "../connection";

// Khởi tạo consumer để lắng nghe queue "auth.get_user"
export const initGetRatingStatsByDoctorIdConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("rating.get_rating_stats_by_doctor_id", {
    durable: false,
  });

  channel.consume("rating.get_rating_stats_by_doctor_id", async (msg) => {
    if (!msg) return;

    try {
      const { doctorId } = JSON.parse(msg.content.toString());
      const rating = await getRatingStatsByDoctorId(doctorId);

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(rating)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing rating.get_rating_stats_by_doctor_id:", err);
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
