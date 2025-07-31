import axios from "services/axios.customize";
import type {
  IAdminProfile,
  IClinic,
  IDoctorProfile,
  IManageUser,
  IPatientProfile,
  ISpecialty,
} from "../types";

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

export const markAsReadNotification = (notificationId: string) => {
  const urlBackend = `/api/notification/mark-as-read/${notificationId}`;
  return axios.put(urlBackend);
};

export const createSpecialty = (
  specialty_name: string,
  description: string,
  icon_path: string
) => {
  const urlBackend = `/api/doctor/specialties`;
  return axios.post<IBackendRes<ISpecialty>>(urlBackend, {
    specialty_name,
    description,
    icon_path,
  });
};

export const createClinic = (
  clinic_name: string,
  city: string,
  district: string,
  street: string,
  phone: string,
  description: string
) => {
  const urlBackend = `/api/doctor/clinics`;
  return axios.post<IBackendRes<ISpecialty>>(urlBackend, {
    clinic_name,
    city,
    district,
    street,
    phone,
    description,
  });
};
