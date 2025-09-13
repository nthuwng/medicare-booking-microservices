import { getChannel } from "../connection";

type AppointmentRoutingKey = "appointment.created"; 

export const publishAppointmentEventClientToDoctor = async (
  routingKey: AppointmentRoutingKey,
  payload: any
): Promise<void> => {
  const channel = getChannel();
  if (!channel) {
    console.error("RabbitMQ channel not available");
    return;
  }

  // Dùng topic để phân loại theo routingKey
  await channel.assertExchange("appointment.exchange.client_to_doctor", "topic", { durable: true });

  const ok = channel.publish(
    "appointment.exchange.client_to_doctor",
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
