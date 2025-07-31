import { rpcRequest } from "./rpcRequest";
import { publishNewDoctorRegistered } from "./sendMessageRegisterDoctor";

const getUserByIdViaRabbitMQ = async (userId: string) => {
  return rpcRequest("auth.get_user", { userId });
};

const getAllDoctorsViaRabbitMQ = async () => {
  return rpcRequest("auth.get_all_users", {});
};

const verifyTokenViaRabbitMQ = async (token: string) => {
  return rpcRequest("auth.verify_token", { token });
};

const checkAdminViaRabbitMQ = async (userId: string) => {
  return rpcRequest("auth.checkAdmin", { userId });
};

const checkDoctorViaRabbitMQ = async (userId: string) => {
  return rpcRequest("auth.checkDoctor", { userId });
};

const sendMessageRegisterDoctorViaRabbitMQ = async (
  userId: string,
  approvalStatus: string,
  avatar_url: string,
  doctorId: string,
  fullName: string,
  phone: string
) => {
  return publishNewDoctorRegistered("doctor.exchange", "doctor.registered", {
    userId,
    approvalStatus,
    avatar_url,
    doctorId,
    fullName,
    phone,
  });
};
export {
  verifyTokenViaRabbitMQ,
  checkAdminViaRabbitMQ,
  getUserByIdViaRabbitMQ,
  getAllDoctorsViaRabbitMQ,
  checkDoctorViaRabbitMQ,
  sendMessageRegisterDoctorViaRabbitMQ,
};
