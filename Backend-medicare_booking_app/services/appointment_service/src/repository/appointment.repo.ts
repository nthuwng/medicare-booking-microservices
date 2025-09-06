import {
  AppointmentStatus,
  Gender,
  PaymentStatus,
  BookingType,
} from "@prisma/client";
import dayjs from "dayjs";
import { prisma } from "src/config/client";

const createAppointmentPatient = async (
  patientName: string,
  patientPhone: string,
  patientEmail: string,
  patientGender: string,
  patientDateOfBirth: Date,
  patientCity: string,
  patientDistrict: string,
  patientAddress: string,
  bookingType: string,
  bookerName?: string,
  bookerPhone?: string,
  bookerEmail?: string,
  reason?: string
) => {
  const patient = await prisma.appointmentPatient.create({
    data: {
      patientName,
      patientPhone,
      patientEmail,
      patientGender: patientGender as Gender,
      patientDateOfBirth: dayjs(patientDateOfBirth)
        .tz("Asia/Ho_Chi_Minh")
        .startOf("day")
        .toDate(),
      patientCity,
      patientDistrict,
      patientAddress,
      bookingType: bookingType as BookingType,
      bookerName: bookerName || null,
      bookerPhone: bookerPhone || null,
      bookerEmail: bookerEmail || null,
      reason: reason || null,
    },
  });
  return patient;
};

const createAppointment = async (
  userId: string,
  doctorId: string,
  clinicId: number,
  specialtyId: number,
  scheduleId: string,
  timeSlotId: number,
  appointmentDateTime: Date,
  status: string,
  patientId: string,
  totalFee: number,
  paymentStatus: string
) => {
  const appointment = await prisma.appointment.create({
    data: {
      userId,
      doctorId,
      clinicId: clinicId,
      specialtyId: specialtyId,
      scheduleId,
      timeSlotId: timeSlotId,
      appointmentDateTime: appointmentDateTime,
      status: status as AppointmentStatus,
      patientId: patientId,
      totalFee: totalFee,
      paymentStatus: paymentStatus as PaymentStatus,
    },
  });
  return appointment;
};

export { createAppointmentPatient, createAppointment };
