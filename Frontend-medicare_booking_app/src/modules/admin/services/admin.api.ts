import axios from "services/axios.customize";
import type {
  IAdminProfile,
  IClinic,
  IDoctorProfile,
  IManageUser,
  INotificationDataAdmin,
  IPatientProfile,
  ISpecialty,
  ITimeSlotDetail,
} from "@/types";

export const getAllSpecialties = (query: string) => {
  const urlBackend = `/api/doctor/specialties?${query}`;
  return axios.get<IBackendRes<IModelPaginate<ISpecialty>>>(urlBackend);
};

export const getAllClinics = (query: string) => {
  const urlBackend = `/api/doctor/clinics?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IClinic>>>(urlBackend);
};

export const getAllUsers = (query: string) => {
  const urlBackend = `/api/auth?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IManageUser>>>(urlBackend);
};

export const getAllAdminsProfile = (query: string) => {
  const urlBackend = `/api/users/admins?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IAdminProfile>>>(urlBackend);
};

export const getAllPatientsProfile = (query: string) => {
  const urlBackend = `/api/users/patients?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IPatientProfile>>>(urlBackend);
};

export const getAllDoctorsProfile = (query: string) => {
  const urlBackend = `/api/doctor/doctors?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IDoctorProfile>>>(urlBackend);
};

export const getDoctorInfo = (doctorId: string) => {
  const urlBackend = `/api/doctor/doctors/${doctorId}`;
  return axios.get<IBackendRes<IDoctorProfile>>(urlBackend);
};

export const approveDoctor = (doctorId: string) => {
  const urlBackend = `/api/doctor/doctors/${doctorId}`;
  return axios.put<IBackendRes<IDoctorProfile>>(urlBackend);
};

export const approveDoctorByAdmin = (doctorId: string, status: string) => {
  const urlBackend = `/api/doctor/doctors/${doctorId}/status`;
  return axios.put<IBackendRes<IDoctorProfile>>(urlBackend, { status });
};

export const markAsReadNotification = (notificationId: string) => {
  const urlBackend = `/api/notification/mark-as-read/${notificationId}`;
  return axios.put(urlBackend);
};

export const getNotificationByUserId = (userId: string) => {
  const urlBackend = `/api/notification/get-notification-by-user-id/${userId}`;
  return axios.get<IBackendRes<INotificationDataAdmin[]>>(urlBackend);
};

export const createSpecialty = (
  specialty_name: string,
  description: string,
  iconPath: string,
  iconPublicId: string
) => {
  const urlBackend = `/api/doctor/specialties`;
  return axios.post<IBackendRes<ISpecialty>>(urlBackend, {
    specialty_name,
    description,
    icon_path: iconPath,
    icon_public_id: iconPublicId,
  });
};

export const uploadFileAPI = (img: any) => {
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

export const createClinic = (
  clinic_name: string,
  city: string,
  district: string,
  street: string,
  phone: string,
  description: string,
  iconPath: string,
  iconPublicId: string
) => {
  const urlBackend = `/api/doctor/clinics`;
  return axios.post<IBackendRes<ISpecialty>>(urlBackend, {
    clinic_name,
    city,
    district,
    street,
    phone,
    description,
    icon_path: iconPath,
    icon_public_id: iconPublicId,
  });
};

export const updateClinics = (
  id: number,
  clinic_name: string,
  city: string,
  district: string,
  street: string,
  phone: string,
  description: string,
  iconPath: string,
  iconPublicId: string
) => {
  const urlBackend = `/api/doctor/clinics/${id}`;
  return axios.put<IBackendRes<IClinic>>(urlBackend, {
    clinic_name,
    city,
    district,
    street,
    phone,
    description,
    icon_path: iconPath,
    icon_public_id: iconPublicId,
  });
};

export const deleteClinics = (clinicId: string) => {
  const urlBackend = `/api/doctor/clinics/${clinicId}`;
  return axios.delete<IBackendRes<string>>(urlBackend);
};

export const updateSpecialty = (
  id: string,
  specialty_name: string,
  description: string,
  iconPath: string,
  iconPublicId: string
) => {
  const urlBackend = `/api/doctor/specialties/${id}`;
  return axios.put<IBackendRes<ISpecialty>>(urlBackend, {
    specialty_name,
    description,
    icon_path: iconPath,
    icon_public_id: iconPublicId,
  });
};

export const deleteSpecialites = (specialtyId: string) => {
  const urlBackend = `/api/doctor/specialties/${specialtyId}`;
  return axios.delete<IBackendRes<string>>(urlBackend);
};

export const getAllTimeSlotsAdmin = () => {
  const urlBackend = `/api/schedule/time-slots`;
  return axios.get<IBackendRes<ITimeSlotDetail[]>>(urlBackend);
};

export const bulkCreateUsersAPI = (users: any[]) => {
  const urlBackend = `/api/auth/bulk-create-users`;
  return axios.post<IBackendRes<IBackendBulkCreateUsersResponse>>(
    urlBackend,
    users
  );
};

export const createOneUserAPI = (user: any) => {
  const urlBackend = `/api/auth/create-one-user`;
  return axios.post<IBackendRes<any>>(urlBackend, user);
};

export const lockUserAPI = (userId: string, lock: boolean) => {
  const urlBackend = `/api/auth/lock-user/${userId}`;
  return axios.put<IBackendRes<any>>(urlBackend, { lock });
};
