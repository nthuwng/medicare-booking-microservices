import axios from "services/axios.customize";
import type {
  IDoctorProfile,
  ISpecialty,
  IClinic,
  ICreateAppointmentInput,
  IBooking,
  ICreateVNPayPaymentInput,
  IPatientProfile,
  IAiRecommendSpecialty,
  IAiSpecialtyDoctorCheck,
} from "@/types";
import type { IAppointment, IAppointmentFullDetail } from "@/types/appointment";
import type { IConversationResponse, IMessage } from "@/types/message";
import type { IRating, IRatingResponse, ITopRateDoctors } from "@/types/rating";

const getAllApprovedDoctorsBooking = (query: string) => {
  const urlBackend = `/api/doctor/doctors/approved?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IDoctorProfile>>>(urlBackend);
};

const getAllSpecialtiesBooking = (query: string) => {
  const urlBackend = `/api/doctor/specialties?${query}`;
  return axios.get<IBackendRes<IModelPaginate<ISpecialty>>>(urlBackend);
};

const getAllClinicsBooking = (query: string) => {
  const urlBackend = `/api/doctor/clinics?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IClinic>>>(urlBackend);
};

const getDoctorDetailBookingById = (doctorId: string) => {
  const urlBackend = `/api/doctor/doctors/${doctorId}`;
  return axios.get<IBackendRes<IDoctorProfile>>(urlBackend);
};

const createBooking = (data: ICreateAppointmentInput) => {
  const urlBackend = `/api/appointment/appointments/create-appointment`;
  return axios.post<IBackendRes<IBooking>>(urlBackend, data);
};

const createVNPayPayment = (data: ICreateVNPayPaymentInput) => {
  const urlBackend = `/api/payment/vnpay/create`;
  return axios.post<IBackendRes<{ paymentId: string; paymentUrl: string }>>(
    urlBackend,
    data
  );
};

const verifyVNPayReturn = (queryParams: string) => {
  const urlBackend = `/api/payment/vnpay/return?${queryParams}`;
  return axios.get<IBackendRes<any>>(urlBackend);
};

const getPatientByUserIdAPI = (userId: string) => {
  const urlBackend = `/api/users/patients/by-user-id/${userId}`;
  return axios.get<IBackendRes<IPatientProfile>>(urlBackend);
};

const getMessagesByConversationIdAPI = (conversationId: string) => {
  const urlBackend = `/api/message/by-conversation-id/${conversationId}`;
  return axios.get<IBackendRes<IMessage[]>>(urlBackend);
};

// API lấy tất cả conversations của patient
const getAllConversationsPatientAPI = (patientId: string) => {
  const urlBackend = `/api/message/conversations/PATIENT/${patientId}`;
  return axios.get<IBackendRes<IConversationResponse>>(urlBackend);
};

// Unread helpers
const getUnreadCountMessageAPI = (userId: string) => {
  const urlBackend = `/api/message/unread-count/${userId}`;
  return axios.get<
    IBackendRes<{
      total: number;
      byConversation: { conversationId: number; count: number }[];
    }>
  >(urlBackend);
};

const markMessagesAsReadAPI = (conversationId: number, userId: string) => {
  const urlBackend = `/api/message/messages/read`;
  return axios.patch<
    IBackendRes<{ conversationId: number; updatedCount: number }>
  >(urlBackend, {
    conversationId,
    userId,
  });
};

// Lấy danh sách lịch đã đặt của bệnh nhân hiện tại
const getMyAppointmentsAPI = () => {
  const urlBackend = `/api/appointment/appointments/my-appointments`;
  return axios.get<IBackendRes<IAppointment[]>>(urlBackend);
};

const getMyAppointmentByIdAPI = (id: string) => {
  const urlBackend = `/api/appointment/appointments/my-appointments/${id}`;
  return axios.get<IBackendRes<IAppointmentFullDetail>>(urlBackend);
};

const chatWithAIAPI = async (file: File, prompt: string) => {
  const fd = new FormData();

  fd.append("image", file);
  fd.append("prompt", prompt);
  const urlBackend = `/api/ai/v1/chat`;
  return axios.post<
    IBackendAiRes<IAiRecommendSpecialty | IAiSpecialtyDoctorCheck | null>
  >(urlBackend, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const getRatingByDoctorIdAPI = (doctorId: string) => {
  const urlBackend = `/api/rating/by-doctorId/${doctorId}`;
  return axios.get<IBackendRes<IRatingResponse>>(urlBackend);
};

const createRatingAPI = (doctorId: string, score: number, content: string) => {
  const urlBackend = `/api/rating`;
  return axios.post<IBackendRes<IRating>>(urlBackend, {
    doctorId,
    score,
    content,
  });
};

const putUpdatePasswordApi = (
  oldPassword: string,
  newPassword: string,
  confirmPassword: string,
  userId: string
) => {
  const urlBackend = `/api/auth/users/${userId}/password`;
  return axios.put<IBackendRes<any>>(urlBackend, {
    oldPassword,
    newPassword,
    confirmPassword,
  });
};

const getPatientProfileAPI = (userId: string) => {
  const urlBackend = `/api/users/patients/by-user-id/${userId}`;
  return axios.get<IBackendRes<IPatientProfile>>(urlBackend);
};

const updatePatientProfileAPI = (
  id: string,
  fullName: string,
  phone: string,
  gender: string,
  dateOfBirth: string,
  address: string,
  city: string,
  district: string,
  avatarUrl: string
) => {
  const urlBackend = `/api/users/patients/update-profile/${id}`;
  return axios.put<IBackendRes<IPatientProfile>>(urlBackend, {
    fullName,
    phone,
    gender,
    dateOfBirth,
    address,
    city,
    district,
    avatarUrl,
  });
};

const deletePatientAvatarAPI = (id: string) => {
  const urlBackend = `/api/users/patients/delete-avatar/${id}`;
  return axios.delete<IBackendRes<any>>(urlBackend);
};

const getTopRateDoctorsAPI = (page: number, pageSize: number) => {
  const urlBackend = `/api/rating/top-rate/doctors?page=${page}&pageSize=${pageSize}`;
  return axios.get<IBackendRes<IModelPaginate<ITopRateDoctors>>>(urlBackend);
};

export {
  getTopRateDoctorsAPI,
  updatePatientProfileAPI,
  getPatientProfileAPI,
  getAllApprovedDoctorsBooking,
  getAllSpecialtiesBooking,
  getAllClinicsBooking,
  getDoctorDetailBookingById,
  createBooking,
  createVNPayPayment,
  verifyVNPayReturn,
  getPatientByUserIdAPI,
  getMessagesByConversationIdAPI,
  getAllConversationsPatientAPI,
  getUnreadCountMessageAPI,
  markMessagesAsReadAPI,
  getMyAppointmentsAPI,
  getMyAppointmentByIdAPI,
  chatWithAIAPI,
  getRatingByDoctorIdAPI,
  createRatingAPI,
  putUpdatePasswordApi,
  deletePatientAvatarAPI,
};
