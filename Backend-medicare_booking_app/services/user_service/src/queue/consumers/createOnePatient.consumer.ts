// src/queue/consumers/notification.registered.consumer.ts


import { createOnePatientProfile } from "src/repository/patient.repo";
import { getChannel } from "../connection";

export const initCreateOnePatientProfileConsumer = async () => {
  const channel = getChannel();
  const exchangeName = "auth.exchange";
  const queueName = "auth.create_one_patient_profile";

  await channel.assertExchange(exchangeName, "topic", { durable: true });
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(
    queueName,
    exchangeName,
    "auth.create_one_patient_profile"
  );

  channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      const { patients }: { patients: any } = JSON.parse(msg.content.toString());
      await createOnePatientProfile(patients);

      channel.ack(msg);
    } catch (err) {
      console.error(
        "[Auth] Error handling auth.create_one_patient_profile:",
        err
      );
      // tránh requeue vô hạn; nếu có DLX thì nack requeue=false sẽ đẩy sang DLQ
      channel.nack(msg, false, false);
    }
  });
};
