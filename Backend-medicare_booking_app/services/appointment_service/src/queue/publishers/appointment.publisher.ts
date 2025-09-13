import { publishAppointmentEventClientToDoctor } from "./appointmentEvent_ClientToDoctor";
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

const checkDoctorViaRabbitMQ = async (userId: string) => {
  return rpcRequest("auth.checkDoctor", { userId });
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

const getDoctorIdByUserIdViaRabbitMQ = async (userId: string) => {
  return rpcRequest("doctor.get_doctor_id_by_user_id", { userId });
};

const getDoctorUserIdByDoctorIdViaRabbitMQ = async (doctorId: string) => {
  return rpcRequest("doctor.get_doctor_user_id_by_doctor_id", { doctorId });
};

const publishAppointmentCreatedEvent = async (payload: any) => {
  return await publishAppointmentEventClientToDoctor(
    "appointment.created",
    payload
  );
};

export {
  verifyTokenViaRabbitMQ,
  checkAdminViaRabbitMQ,
  getUserByIdViaRabbitMQ,
  checkPatientByIdViaRabbitMQ,
  checkDoctorViaRabbitMQ,
  checkScheduleViaRabbitMQ,
  updateScheduleViaRabbitMQ,
  getDoctorIdByUserIdViaRabbitMQ,
  publishAppointmentCreatedEvent,
  getDoctorUserIdByDoctorIdViaRabbitMQ,
};
