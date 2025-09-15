import axios from "services/axios.customize";
import type {
  IDoctorProfile,
  ISpecialty,
  IClinic,
  ICreateAppointmentInput,
  IBooking,
  ICreateVNPayPaymentInput,
  IPatient,
  IPatientProfile,
} from "@/types";
import type {
  IConversation,
  IConversationResponse,
  IMessage,
} from "@/types/message";

export const getAllApprovedDoctorsBooking = (query: string) => {
  const urlBackend = `/api/doctor/doctors/approved?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IDoctorProfile>>>(urlBackend);
};

export const getAllSpecialtiesBooking = (query: string) => {
  const urlBackend = `/api/doctor/specialties?${query}`;
  return axios.get<IBackendRes<IModelPaginate<ISpecialty>>>(urlBackend);
};

export const getAllClinicsBooking = (query: string) => {
  const urlBackend = `/api/doctor/clinics?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IClinic>>>(urlBackend);
};

export const getDoctorDetailBookingById = (doctorId: string) => {
  const urlBackend = `/api/doctor/doctors/${doctorId}`;
  return axios.get<IBackendRes<IDoctorProfile>>(urlBackend);
};

export const getConversationByDoctorIdAPI = (doctorId: string) => {
  const urlBackend = `/api/message/conversations/${doctorId}`;
  return axios.get<IBackendRes<IConversation>>(urlBackend);
};

export const createBooking = (data: ICreateAppointmentInput) => {
  const urlBackend = `/api/appointment/appointments/create-appointment`;
  return axios.post<IBackendRes<IBooking>>(urlBackend, data);
};

export const createVNPayPayment = (data: ICreateVNPayPaymentInput) => {
  const urlBackend = `/api/payment/vnpay/create`;
  return axios.post<IBackendRes<{ paymentId: string; paymentUrl: string }>>(
    urlBackend,
    data
  );
};

export const verifyVNPayReturn = (queryParams: string) => {
  const urlBackend = `/api/payment/vnpay/return?${queryParams}`;
  return axios.get<IBackendRes<any>>(urlBackend);
};

export const getPatientByUserIdAPI = (userId: string) => {
  const urlBackend = `/api/users/patients/by-user-id/${userId}`;
  return axios.get<IBackendRes<IPatientProfile>>(urlBackend);
};

export const getMessagesByConversationIdAPI = (conversationId: string) => {
  const urlBackend = `/api/message/by-conversation-id/${conversationId}`;
  return axios.get<IBackendRes<IMessage[]>>(urlBackend);
};

// API lấy tất cả conversations của patient
export const getAllConversationsAPI = (patientId: string) => {
  const urlBackend = `/api/message/conversations/patient/${patientId}`;
  return axios.get<IBackendRes<IConversationResponse>>(urlBackend);
};

