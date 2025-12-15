import { publishUpdatePaymentStatus } from "./appointmentEventUpdate";
import { rpcRequest } from "./rpcRequest";

const updatePaymentStatusViaRabbitMQ = async (appointmentId: string) => {
  return await publishUpdatePaymentStatus(appointmentId);
};

const getClinicByHospitalIdViaRabbitMQ = async (payments: any[]) => {
  const hospitalIds = [...new Set(payments.map((p) => p.hospitalId))];
  return rpcRequest("doctor.get_clinic_by_hospital_id", { hospitalIds });
};

export { updatePaymentStatusViaRabbitMQ, getClinicByHospitalIdViaRabbitMQ };
