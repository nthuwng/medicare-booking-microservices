import { rpcRequest } from "./rpcRequest";

const getUserByIdViaRabbitMQ = async (userId: string) => {
  return rpcRequest("auth.get_user", { userId });
};

const verifyTokenViaRabbitMQ = async (token: string) => {
  return rpcRequest("auth.verify_token", { token });
};

const checkAdminViaRabbitMQ = async (userId: string) => {
  return rpcRequest("auth.checkAdmin", { userId });
};

export {
  verifyTokenViaRabbitMQ,
  checkAdminViaRabbitMQ,
  getUserByIdViaRabbitMQ,
};
