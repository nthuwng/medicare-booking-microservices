import { rpcRequest } from "./rpcRequest";
import { publishUpdateTimeSlot } from "./scheduleEventUpdate";

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

const updateScheduleViaRabbitMQ = async (
  scheduleId: string,
  timeSlotId: string
) => {
  return await publishUpdateTimeSlot(scheduleId, timeSlotId);
};

export {
  verifyTokenViaRabbitMQ,
  checkAdminViaRabbitMQ,
  getUserByIdViaRabbitMQ,
  checkPatientByIdViaRabbitMQ,
  checkDoctorViaRabbitMQ,
  checkScheduleViaRabbitMQ,
  updateScheduleViaRabbitMQ,
};
