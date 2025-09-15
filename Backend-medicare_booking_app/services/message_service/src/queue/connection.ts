import amqp from "amqplib";
import "dotenv/config";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL || "amqp://localhost"
  );
  channel = await connection.createChannel();
  return channel;
};

export const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized!");
  }
  return channel;
};
