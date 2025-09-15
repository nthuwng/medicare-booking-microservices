import { getChannel } from "../connection";
import { randomUUID } from "crypto";

export const rpcRequest = async (
  queueName: string,
  payload: any,
  timeoutMs = 5000
): Promise<any> => {
  const channel = getChannel();

  const { queue: replyQueue } = await channel.assertQueue("", {
    exclusive: true,
    autoDelete: true,
  });

  const correlationId = randomUUID();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Request timeout"));
    }, timeoutMs);

    channel.consume(
      replyQueue,
      (msg) => {
        if (!msg) return;
        if (msg.properties.correlationId === correlationId) {
          clearTimeout(timeout);
          const response = JSON.parse(msg.content.toString());
          resolve(response);
          channel.ack(msg);
        }
      },
      { noAck: false }
    );

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), {
      correlationId,
      replyTo: replyQueue,
    });
  });
};