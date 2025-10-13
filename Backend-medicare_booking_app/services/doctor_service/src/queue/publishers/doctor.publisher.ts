import { rpcRequest } from "./rpcRequest";
import { publishDoctorEvent } from "./DoctorEvent";

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
  return publishDoctorEvent("doctor.registered", {
    userId,
    approvalStatus,
    avatar_url,
    doctorId,
    fullName,
    phone,
  });
};

const sendMessageUpdateDoctorStatusViaRabbitMQ = async (
  userId: string,
  approvalStatus: string,
  avatar_url: string,
  doctorId: string,
  fullName: string,
  phone: string
) => {
  return publishDoctorEvent("doctor.approved", {
    userId,
    approvalStatus,
    avatar_url,
    doctorId,
    fullName,
    phone,
  });
};

const getScheduleByDoctorIdViaRabbitMQ = async (doctorId: string) => {
  return rpcRequest("schedule.get_schedule_by_doctor_id", { doctorId });
};

const getRatingByDoctorIdViaRabbitMQ = async (doctorId: string) => {
  return rpcRequest("rating.get_rating_by_doctor_id", { doctorId });
};

export {
  verifyTokenViaRabbitMQ,
  checkAdminViaRabbitMQ,
  getUserByIdViaRabbitMQ,
  getAllDoctorsViaRabbitMQ,
  checkDoctorViaRabbitMQ,
  sendMessageRegisterDoctorViaRabbitMQ,
  sendMessageUpdateDoctorStatusViaRabbitMQ,
  getScheduleByDoctorIdViaRabbitMQ,
  getRatingByDoctorIdViaRabbitMQ
};
