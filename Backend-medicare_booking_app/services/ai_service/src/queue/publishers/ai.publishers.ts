import { rpcRequest } from "./rpcRequest";

const checkSpecialtyDoctorViaRabbitMQ = async (specialtyName: string) => {
  return rpcRequest("doctor.check_specialty_doctor", { specialtyName });
};

export { checkSpecialtyDoctorViaRabbitMQ };
