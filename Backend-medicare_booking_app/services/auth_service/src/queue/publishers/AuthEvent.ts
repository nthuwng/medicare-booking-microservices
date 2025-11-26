import { getChannel } from "../connection";

type AuthRoutingKey =
  | "auth.import_doctor_profile"
  | "auth.create_one_doctor_profile"
  | "auth.create_one_patient_profile"
  | "auth.create_one_admin_profile";

export const publishAuthEvent = async (
  routingKey: AuthRoutingKey,
  payload: any // phải là object, không pass thẳng array
): Promise<void> => {
  const channel = await getChannel(); // lưu ý: nên await
  if (!channel) {
    console.error("RabbitMQ channel not available");
    return;
  }

  await channel.assertExchange("auth.exchange", "topic", { durable: true });

  const body = {
    event: routingKey,
    occurredAt: new Date().toISOString(),
    ...payload, // <-- payload là { items: [...] }
  };

  const ok = channel.publish(
    "auth.exchange",
    routingKey,
    Buffer.from(JSON.stringify(body)),
    { persistent: true, contentType: "application/json" }
  );
  if (!ok) await new Promise((r) => channel.once("drain", r));
};
