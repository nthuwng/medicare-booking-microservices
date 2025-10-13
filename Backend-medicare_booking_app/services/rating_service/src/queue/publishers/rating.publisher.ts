import { rpcRequest } from "./rpcRequest";

const verifyTokenViaRabbitMQ = async (token: string) => {
  return rpcRequest("auth.verify_token", { token });
};

export {
  verifyTokenViaRabbitMQ,
};
