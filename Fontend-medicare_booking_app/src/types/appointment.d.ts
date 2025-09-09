import type { ISchedule } from "@/types";

export interface IAppointment {
  id: string;
  userId: string;
  doctorId: string;
  clinicId: number;
  specialtyId: number;
  scheduleId: string;
  timeSlotId: number;
  appointmentDateTime: string;
  status: string;
  patientId: string;
  totalFee: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  patient: IPatient;
  schedule: ISchedule;
  doctor: IDoctorAppointment;
}

export interface IPatient {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientGender: string;
  patientDateOfBirth: string;
  patientCity: string;
  patientDistrict: string;
  patientAddress: string;
  bookingType: string;
  bookerName: string;
  bookerPhone: string;
  bookerEmail: string;
  reason: string;
}

export interface IDoctorAppointment {
  id: string;
  fullName: string;
  gender: string;
  phone: string;
  experienceYears: number;
  avatarUrl: string;
  title: string;
  approvalStatus: string;
  consultationFee: string;
  bookingFee: string;
  clinicId: number;
  specialtyId: number;
  isApproved: boolean;
}
