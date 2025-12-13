import { getChannel } from "../connection";

export const publishCreatePaymentDefault = async (
  appointmentId: string,
  totalFee: string,
  hospitalId: string,
  patientId: string
) => {
  const channel = getChannel();

  await channel.assertQueue("payment.create_payment_default", {
    durable: false,
  });

  channel.sendToQueue(
    "payment.create_payment_default",
    Buffer.from(JSON.stringify({ appointmentId, totalFee , hospitalId, patientId }))
  );
};
