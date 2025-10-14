import { rpcRequest } from "./rpcRequest";

const verifyTokenViaRabbitMQ = async (token: string) => {
  return rpcRequest("auth.verify_token", { token });
};

const getUserProfileByUserIdViaRabbitMQ = async (userId: string) => {
  return rpcRequest("user.getUserProfileByUserId", { userId });
};

export {
  verifyTokenViaRabbitMQ,
  getUserProfileByUserIdViaRabbitMQ,
};
