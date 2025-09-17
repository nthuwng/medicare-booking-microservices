import { getChannel } from "../connection";

type MsgEventToNotificationRoutingKey = "message.created"; 

export const publishMsgEventToNotification = async (
  routingKey: MsgEventToNotificationRoutingKey,
  payload: any
): Promise<void> => {
  const channel = getChannel();
  if (!channel) {
    console.error("RabbitMQ channel not available");
    return;
  }

  // Dùng topic để phân loại theo routingKey
  await channel.assertExchange("message.exchange", "topic", { durable: true });

  const ok = channel.publish(
    "message.exchange",
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
