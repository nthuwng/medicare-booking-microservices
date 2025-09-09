import {
  CreateAppointmentInput,
  AppointmentResponse,
  AppointmentStatus,
  PaymentStatus,
  Gender,
} from "@shared/index";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { prisma } from "src/config/client";
import {
  checkScheduleViaRabbitMQ,
  updateScheduleViaRabbitMQ,
} from "src/queue/publishers/appointment.publisher";
import {
  createAppointment,
  createAppointmentPatient,
} from "src/repository/appointment.repo";

// Config timezone cho dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const createAppointmentService = async (
  body: CreateAppointmentInput,
  userId: string
): Promise<AppointmentResponse> => {
  const {
    scheduleId,
    timeSlotId,
    reason,
    patientName,
    patientPhone,
    patientEmail,
    patientGender,
    patientDateOfBirth,
    patientCity,
    patientDistrict,
    patientAddress,
    bookerName,
    bookerPhone,
    bookerEmail,
  } = body;

  // Get schedule information (includes doctor info and timeSlots)
  const scheduleResponse = await checkScheduleViaRabbitMQ(scheduleId);
  if (!scheduleResponse || !scheduleResponse.data) {
    throw new Error("Lịch khám không tồn tại");
  }

  const { schedule: scheduleArray, doctor } = scheduleResponse.data;

  // Schedule is an array, get the first element
  if (!scheduleArray || scheduleArray.length === 0) {
    throw new Error("Lịch khám không tồn tại");
  }

  const schedule = scheduleArray[0];

  if (!schedule.isAvailable) {
    throw new Error("Lịch khám không khả dụng");
  }

  // Extract data from schedule response
  const doctorId = schedule.doctorId;
  const clinicId = schedule.clinicId;
  const specialtyId = doctor.specialtyId;

  // Use dayjs for professional date handling - parse as UTC then get local date

  const scheduleDate = dayjs(schedule.date)
    .tz("Asia/Ho_Chi_Minh")
    .startOf("day");
  const appointmentDate = scheduleDate.format("YYYY-MM-DD");

  // Find the specific timeSlot
  const selectedTimeSlot = schedule.timeSlots.find(
    (slot: any) => slot.timeSlotId === parseInt(timeSlotId)
  );

  if (!selectedTimeSlot) {
    throw new Error("Khung giờ này không có trong lịch khám của bác sĩ");
  }

  // Extract appointment time from timeSlot using dayjs
  const appointmentTime = dayjs(selectedTimeSlot.timeSlot.startTime).format(
    "HH:mm"
  );

  // Check if slot is full
  for (const timeSlot of schedule.timeSlots) {
    if (timeSlot.timeSlotId === parseInt(timeSlotId)) {
      if (timeSlot.currentBooking >= timeSlot.maxBooking) {
        throw new Error(
          "Khung giờ này đã hết chỗ. Vui lòng chọn khung giờ khác"
        );
      }
    }
  }

  // Validate doctor is approved
  if (!doctor.isApproved) {
    throw new Error("Bác sĩ chưa được duyệt");
  }

  // Calculate total fee from doctor's consultation and booking fees
  const consultationFee = parseFloat(doctor.consultationFee) || 0;
  const bookingFee = parseFloat(doctor.bookingFee) || 0;
  const totalFee = consultationFee + bookingFee;

  // Check for duplicate appointment
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      userId,
      doctorId,
      scheduleId,
      timeSlotId: parseInt(timeSlotId),
      appointmentDateTime: {
        gte: new Date(appointmentDate + "T00:00:00.000Z"),
        lt: new Date(appointmentDate + "T23:59:59.999Z"),
      },
    },
  });

  if (existingAppointment) {
    throw new Error("Bạn đã có lịch hẹn này rồi");
  }

  // Determine booking type based on whether booker info is provided
  const bookingType = bookerName && bookerPhone ? "Relative" : "Self";

  // Create patient record first
  const patient = await createAppointmentPatient(
    patientName,
    patientPhone,
    patientEmail || "",
    patientGender,
    dayjs(patientDateOfBirth).tz("Asia/Ho_Chi_Minh").startOf("day").toDate(),
    patientCity,
    patientDistrict,
    patientAddress,
    bookingType,
    bookerName,
    bookerPhone,
    bookerEmail,
    reason
  );

  // Create appointment
  const appointment = await createAppointment(
    userId,
    doctorId,
    clinicId,
    specialtyId,
    scheduleId,
    parseInt(timeSlotId),
    new Date(appointmentDate + "T" + appointmentTime),
    "Pending",
    patient.id,
    totalFee,
    "Unpaid"
  );

  await updateScheduleViaRabbitMQ(scheduleId, timeSlotId);

  return {
    appointment: {
      id: appointment.id,
      userId: appointment.userId,
      doctorId: appointment.doctorId,
      clinicId: appointment.clinicId,
      specialtyId: appointment.specialtyId,
      scheduleId: appointment.scheduleId,
      timeSlotId: appointment.timeSlotId,
      appointmentDateTime: appointment.appointmentDateTime,
      status: appointment.status as AppointmentStatus,
      patientId: appointment.patientId,
      totalFee: Number(appointment.totalFee),
      paymentStatus: appointment.paymentStatus as PaymentStatus,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    },
    patient: {
      id: patient.id,
      patientName: patient.patientName,
      patientPhone: patient.patientPhone,
      patientEmail: patient.patientEmail || undefined,
      patientGender: patient.patientGender as Gender,
      patientDateOfBirth: patient.patientDateOfBirth,
      patientCity: patient.patientCity,
      patientDistrict: patient.patientDistrict,
      patientAddress: patient.patientAddress,
      bookerName: patient.bookerName || undefined,
      bookerPhone: patient.bookerPhone || undefined,
      bookerEmail: patient.bookerEmail || undefined,
      reason: patient.reason || undefined,
    },
  };
};

// Get appointments by user
const getAppointmentsByUserService = async (userId: string) => {
  const appointments = await prisma.appointment.findMany({
    where: { userId },
    include: {
      patient: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return appointments;
};

// Get appointment by ID
const getAppointmentByIdService = async (appointmentId: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
    },
  });

  if (!appointment) {
    throw new Error("Cuộc hẹn không tồn tại");
  }

  return appointment;
};

// Update appointment status
const updateAppointmentStatusService = async (
  appointmentId: string,
  status: AppointmentStatus
) => {
  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: {
      patient: true,
    },
  });

  return appointment;
};

// Get payment information by appointment ID
const putPaymentByAppointmentIdService = async (appointmentId: string) => {
  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      paymentStatus: "Paid",
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  return {
    id: appointment.id,
    totalFee: Number(appointment.totalFee),
    paymentStatus: appointment.paymentStatus,
    userId: appointment.userId,
    doctorId: appointment.doctorId,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  };
};

const countTotalAppointmentPage = async (pageSize: number) => {
  const totalItems = await prisma.appointment.count();

  const totalPages = Math.ceil(totalItems / pageSize);

  return totalPages;
};

const handleAppointmentsByDoctorIdServices = async (
  doctorId: string,
  page: number,
  pageSize: number
) => {
  const skip = (page - 1) * pageSize;
  const appointments = await prisma.appointment.findMany({
    include: {
      patient: true,
    },
    skip: skip,
    take: pageSize,
  });

  const appointmentsWithScheduleInfo = await Promise.all(
    appointments.map(async (appointment) => {
      try {
        const schedule = await checkScheduleViaRabbitMQ(appointment.scheduleId);

        const { schedule: scheduleArray, doctor } = schedule.data;

        return {
          ...appointment,
          schedule: scheduleArray,
          doctor,
        };
      } catch (error) {
        console.error(
          `Error fetching doctor/clinic info for schedule ${appointment.scheduleId}:`,
          error
        );
      }
    })
  );

  return {
    appointments: appointmentsWithScheduleInfo,
    totalAppointments: appointments.length,
  };
};

export {
  createAppointmentService,
  getAppointmentsByUserService,
  getAppointmentByIdService,
  updateAppointmentStatusService,
  putPaymentByAppointmentIdService,
  handleAppointmentsByDoctorIdServices,
  countTotalAppointmentPage,
};
