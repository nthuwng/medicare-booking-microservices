import { publishUpdatePaymentStatus } from "./appointmentEventUpdate";
import { rpcRequest } from "./rpcRequest";

const updatePaymentStatusViaRabbitMQ = async (appointmentId: string) => {
  return await publishUpdatePaymentStatus(appointmentId);
};
export { updatePaymentStatusViaRabbitMQ };
