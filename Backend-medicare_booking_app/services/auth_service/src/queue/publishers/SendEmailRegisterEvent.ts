import { getChannel } from "../connection";

type AuthRoutingKey = "auth.register";

export const publishSendEmailRegisterEvent = async (
  routingKey: AuthRoutingKey,
  payload: any // phải là object, không pass thẳng array
): Promise<void> => {
  const channel = await getChannel(); // lưu ý: nên await
  if (!channel) {
    console.error("RabbitMQ channel not available");
    return;
  }

  await channel.assertExchange("auth.exchange", "topic", { durable: true });

  const ok = channel.publish(
    "auth.exchange",
    routingKey,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true, contentType: "application/json" }
  );
  if (!ok) await new Promise((r) => channel.once("drain", r));
};
