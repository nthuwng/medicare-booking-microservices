import { getChannel } from "../connection";

export const publishUpdatePaymentStatus = async (appointmentId: string) => {
  const channel = getChannel();

  await channel.assertQueue("appointment.update_payment_status", {
    durable: false,
  });

  channel.sendToQueue(
    "appointment.update_payment_status",
    Buffer.from(JSON.stringify({ appointmentId }))
  );
};
