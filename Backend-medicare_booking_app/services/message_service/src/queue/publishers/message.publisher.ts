import { publishMsgEventToNotification } from "./msgEventToNotification";
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

const checkDoctorViaRabbitMQ = async (userId: string) => {
  return rpcRequest("auth.checkDoctor", { userId });
};

const getPatientByIdViaRabbitMQ = async (patientId: string) => {
  return rpcRequest("user.getPatientById", { patientId });
};

const getDoctorByIdViaRabbitMQ = async (doctorId: string) => {
  return rpcRequest("doctor.check_doctor_profile", { doctorId });
};

const publishMsgCreatedEvent = async (
  patientId: string,
  doctorUserId: string
) => {
  return await publishMsgEventToNotification("message.created", {
    patientId,
    doctorUserId,
  });
};

const getDoctorUserIdByDoctorIdViaRabbitMQ = async (doctorId: string) => {
  return rpcRequest("doctor.get_doctor_user_id_by_doctor_id", { doctorId });
};

export {
  verifyTokenViaRabbitMQ,
  checkAdminViaRabbitMQ,
  getUserByIdViaRabbitMQ,
  checkDoctorViaRabbitMQ,
  getPatientByIdViaRabbitMQ,
  getDoctorByIdViaRabbitMQ,
  publishMsgCreatedEvent,
  getDoctorUserIdByDoctorIdViaRabbitMQ,
};
