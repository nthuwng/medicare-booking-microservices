import { rpcRequest } from "./rpcRequest";

const verifyTokenViaRabbitMQ = async (token: string) => {
  return rpcRequest("auth.verify_token", { token });
};

const checkAdminViaRabbitMQ = async (userId: string) => {
  return rpcRequest("auth.checkAdmin", { userId });
};

const getUserByIdViaRabbitMQ = async (userId: string) => {
  return rpcRequest("auth.get_user", { userId });
};

const checkPatientByIdViaRabbitMQ = async (userId: string) => {
  return rpcRequest("auth.check_patient", { userId });
};

const checkDoctorViaRabbitMQ = async (doctorId: string) => {
  return rpcRequest("doctor.check_doctor_", { doctorId });
};

const checkScheduleViaRabbitMQ = async (scheduleId: string) => {
  return rpcRequest("schedule.check_schedule", { scheduleId });
};

export {
  verifyTokenViaRabbitMQ,
  checkAdminViaRabbitMQ,
  getUserByIdViaRabbitMQ,
  checkPatientByIdViaRabbitMQ,
  checkDoctorViaRabbitMQ,
  checkScheduleViaRabbitMQ,
};
