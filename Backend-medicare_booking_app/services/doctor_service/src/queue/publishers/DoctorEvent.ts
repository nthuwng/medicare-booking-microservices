import { getChannel } from "../connection";

type DoctorRoutingKey = "doctor.registered" | "doctor.approved";

export const publishDoctorEvent = async (
  routingKey: DoctorRoutingKey,
  payload: any
): Promise<void> => {
  const channel = getChannel();
  if (!channel) {
    console.error("RabbitMQ channel not available");
    return;
  }

  // Dùng topic để phân loại theo routingKey
  await channel.assertExchange("doctor.exchange", "topic", { durable: true });

  const ok = channel.publish(
    "doctor.exchange",
    routingKey,
    Buffer.from(
      JSON.stringify({
        event: routingKey,
        occurredAt: new Date().toISOString(),
        ...payload,
      })
    ),
    { persistent: true, contentType: "application/json" }
  );

  if (!ok) await new Promise((r) => channel.once("drain", r));
};
