import axios from "services/axios.customize";
import type {
  IAppointment,
  IClinic,
  IDoctorProfile,
  INotificationDataAdmin,
  IPatientProfile,
  ISpecialty,
} from "@/types";
import type {
  ICreateSchedule,
  ISchedule,
  ITimeSlotDetail,
} from "@/types/schedule";
import type { IConversationResponseDoctor, IMessage } from "@/types/message";
import type { IRatingResponse } from "@/types/rating";

const getDoctorProfileByUserId = (userId: string) => {
  const urlBackend = `/api/doctor/doctors/profile/${userId}`;
  return axios.get<IBackendRes<IDoctorProfile>>(urlBackend);
};

const getAllSpecialtiesDoctorProFile = () => {
  const urlBackend = `/api/doctor/specialties?page=1&pageSize=100`;
  return axios.get<IBackendRes<IModelPaginate<ISpecialty>>>(urlBackend);
};

const getAllClinics = () => {
  const urlBackend = `/api/doctor/clinics?page=1&pageSize=100`;
  return axios.get<IBackendRes<IModelPaginate<IClinic>>>(urlBackend);
};

const markAsReadNotification = (notificationId: string) => {
  const urlBackend = `/api/notification/mark-as-read/${notificationId}`;
  return axios.put(urlBackend);
};

const markAsReadAllNotification = (userId: string) => {
  const urlBackend = `/api/notification/mark-as-read-all/${userId}`;
  return axios.put(urlBackend);
};

const deleteAllNotification = (userId: string) => {
  const urlBackend = `/api/notification/delete-all/${userId}`;
  return axios.delete(urlBackend);
};

const getNotificationByUserId = (userId: string) => {
  const urlBackend = `/api/notification/get-notification-by-user-id/${userId}`;
  return axios.get<IBackendRes<INotificationDataAdmin[]>>(urlBackend);
};

const uploadFileAPI = (img: any) => {
  const bodyFormData = new FormData();
  bodyFormData.append("image", img);
  return axios<
    IBackendRes<{
      url: string;
      public_id: string;
    }>
  >({
    method: "post",
    url: "/api/doctor/upload/image",
    data: bodyFormData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const createDoctorProfile = (
  fullName: string,
  phone: string,
  gender: string,
  title: string,
  experienceYears: number,
  avatar_url: string,
  specialtyId: string,
  clinicId: string,
  bookingFee: number,
  consultationFee: number,
  bio: string,
  avatar_public_id: string
) => {
  const urlBackend = `/api/doctor/doctors`;
  return axios.post<IBackendRes<IDoctorProfile>>(urlBackend, {
    fullName,
    phone,
    gender,
    title,
    experienceYears,
    avatar_url,
    specialtyId,
    clinicId,
    bookingFee,
    consultationFee,
    bio,
    avatar_public_id,
  });
};

const getScheduleByDoctorId = (
  userId: string,
  filters?: {
    date?: string;
    from?: string;
    to?: string;
  }
) => {
  const urlBackend = `/api/schedule/schedules/by-doctorId/${userId}`;
  const params = new URLSearchParams();

  if (filters?.date) {
    params.append("date", filters.date);
  }
  if (filters?.from) {
    params.append("from", filters.from);
  }
  if (filters?.to) {
    params.append("to", filters.to);
  }

  const queryString = params.toString();
  const fullUrl = queryString ? `${urlBackend}?${queryString}` : urlBackend;

  return axios.get<IBackendRes<ISchedule[]>>(fullUrl);
};

const getAllTimeSlots = () => {
  const urlBackend = `/api/schedule/time-slots`;
  return axios.get<IBackendRes<ITimeSlotDetail[]>>(urlBackend);
};

const updateExpiredTimeSlots = () => {
  const urlBackend = `/api/schedule/schedules/update-expired`;
  return axios.patch<IBackendRes<any>>(urlBackend);
};

const getAllAppointmentsByDoctorId = (query: string) => {
  const urlBackend = `/api/appointment/appointments/doctor-appointments/${query}`;
  return axios.get<IBackendRes<IModelPaginate<IAppointment>>>(urlBackend);
};

const getAllConversationsDoctorAPI = (doctorId: string) => {
  const urlBackend = `/api/message/conversations/DOCTOR/${doctorId}`;
  return axios.get<IBackendRes<IConversationResponseDoctor>>(urlBackend);
};

const getPatientDetailBookingById = (patientId: string) => {
  const urlBackend = `/api/users/patients/${patientId}`;
  return axios.get<IBackendRes<IPatientProfile>>(urlBackend);
};

const getMessagesByConversationIdAPI = (conversationId: string) => {
  const urlBackend = `/api/message/by-conversation-id/${conversationId}`;
  return axios.get<IBackendRes<IMessage[]>>(urlBackend);
};

// Unread helpers for doctor side (same endpoints)
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

const createSchedule = (
  doctorId: string,
  date: string,
  clinicId: number,
  timeSlotId: number[]
) => {
  const urlBackend = `/api/schedule/schedules`;
  return axios.post<IBackendRes<ICreateSchedule>>(urlBackend, {
    doctorId,
    date,
    clinicId,
    timeSlotId,
  });
};

const updateAppointmentStatus = (appointmentId: string, status: string) => {
  const urlBackend = `/api/appointment/appointments/update-appointment-status/${appointmentId}`;
  return axios.put<IBackendRes<IAppointment>>(urlBackend, { status });
};

const deleteScheduleByScheduleIdAPI = (scheduleId: string) => {
  const urlBackend = `/api/schedule/schedules/by-doctorId/${scheduleId}`;
  return axios.delete<IBackendRes<any>>(urlBackend);
};

const deleteTimeSlotFromScheduleAPI = (
  scheduleId: string,

  timeSlotId: number | string
) => {
  const urlBackend = `/api/schedule/schedules/by-timeSlotId/${scheduleId}/${timeSlotId}`;
  return axios.delete<IBackendRes<any>>(urlBackend);
};

const fetchRatingByDoctorIdAPI = (doctorId: string) => {
  const urlBackend = `/api/rating/by-doctorId/${doctorId}`;
  return axios.get<IBackendRes<IRatingResponse>>(urlBackend);
};

export {
  getDoctorProfileByUserId,
  fetchRatingByDoctorIdAPI,
  getAllSpecialtiesDoctorProFile,
  getAllClinics,
  markAsReadNotification,
  markAsReadAllNotification,
  deleteAllNotification,
  getNotificationByUserId,
  uploadFileAPI,
  createDoctorProfile,
  getScheduleByDoctorId,
  getAllTimeSlots,
  updateExpiredTimeSlots,
  getAllAppointmentsByDoctorId,
  getAllConversationsDoctorAPI,
  getPatientDetailBookingById,
  getMessagesByConversationIdAPI,
  getUnreadCountMessageAPI,
  markMessagesAsReadAPI,
  createSchedule,
  updateAppointmentStatus,
  deleteScheduleByScheduleIdAPI,
  deleteTimeSlotFromScheduleAPI,
};
