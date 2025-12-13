import { publishAppointmentEventClientToDoctor } from "./appointmentEvent_ClientToDoctor";
import { publishCreatePaymentDefault } from "./createPaymentDefault";
import { rpcRequest } from "./rpcRequest";
import { publishUpdateTimeSlot } from "./scheduleEventUpdate";
import { publishUpdateCancelScheduleAndTimeSlotId } from "./updateScheduleCancelEvent";

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
const checkFullDetailDoctorViaRabbitMQ = async (doctorId: string) => {
  return rpcRequest("doctor.check_full_detail_doctor", { doctorId });
};

const checkScheduleAndTimeslotIdViaRabbitMQ = async (
  scheduleId: string,
  timeSlotId: number
) => {
  return rpcRequest("schedule.check_schedule_and_timeslot_id", {
    scheduleId,
    timeSlotId,
  });
};

const updateCancelScheduleAndTimeSlotIdViaRabbitMQ = async (
  scheduleId: string,
  timeSlotId: string
) => {
  return await publishUpdateCancelScheduleAndTimeSlotId(scheduleId, timeSlotId);
};

const updateCancelPaymentByAppointmentIdViaRabbitMQ = async (
  appointmentId: string
) => {
  return rpcRequest("payment.update_cancel_payment_by_appointment_id", {
    appointmentId,
  });
};

const getPaymentByAppointmentIdViaRabbitMQ = async (appointmentId: string) => {
  return rpcRequest("payment.get_payment_by_appointment_id", { appointmentId });
};

const createPaymentDefaultViaRabbitMQ = async (
  appointmentId: string,
  amount: string,
  hospitalId: string,
  patientId: string
) => {
  return await publishCreatePaymentDefault(appointmentId, amount, hospitalId, patientId);
};

export {
  createPaymentDefaultViaRabbitMQ,
  updateCancelPaymentByAppointmentIdViaRabbitMQ,
  updateCancelScheduleAndTimeSlotIdViaRabbitMQ,
  getPaymentByAppointmentIdViaRabbitMQ,
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
  checkFullDetailDoctorViaRabbitMQ,
  checkScheduleAndTimeslotIdViaRabbitMQ,
};
