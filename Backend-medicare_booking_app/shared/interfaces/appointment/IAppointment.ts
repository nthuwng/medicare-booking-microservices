import { Gender } from "../common/enums";

export enum AppointmentStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export enum PaymentStatus {
  Unpaid = "Unpaid",
  Paid = "Paid",
}

export interface CreateAppointmentInput {
  scheduleId: string;
  timeSlotId: string;
  reason?: string;

  // Patient information
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientGender: Gender;
  patientDateOfBirth: string; // YYYY-MM-DD
  patientCity: string;
  patientDistrict: string;
  patientAddress: string;

  // Optional booker info (nếu đặt cho người khác)
  bookerName?: string;
  bookerPhone?: string;
  bookerEmail?: string;
}

export interface AppointmentResponse {
  appointment: {
    id: string;
    userId: string;
    doctorId: string;
    clinicId: number;
    specialtyId: number;
    scheduleId: string;
    timeSlotId: number;
    appointmentDateTime: Date;
    status: AppointmentStatus;
    patientId: string;
    totalFee: number;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
  };
  patient: {
    id: string;
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    patientGender: Gender;
    patientDateOfBirth: Date;
    patientCity: string;
    patientDistrict: string;
    patientAddress: string;
    bookerName?: string;
    bookerPhone?: string;
    bookerEmail?: string;
    reason?: string;
  };
}
