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
  checkFullDetailDoctorViaRabbitMQ,
  checkScheduleAndTimeslotIdViaRabbitMQ,
  checkScheduleViaRabbitMQ,
  createPaymentDefaultViaRabbitMQ,
  getDoctorUserIdByDoctorIdViaRabbitMQ,
  getPaymentByAppointmentIdViaRabbitMQ,
  publishAppointmentCreatedEvent,
  updateCancelPaymentByAppointmentIdViaRabbitMQ,
  updateCancelScheduleAndTimeSlotIdViaRabbitMQ,
  updateScheduleViaRabbitMQ,
} from "src/queue/publishers/appointment.publisher";
import {
  createAppointment,
  createAppointmentPatient,
} from "src/repository/appointment.repo";
import {
  AllAppointmentByDoctorCache,
  AllAppointmentByDoctorCacheParams,
} from "src/cache/appointmentDoctor.cache";
import {
  AllWeeklyScheduleCache,
  AllWeeklyScheduleCacheParams,
} from "src/cache/weeklySchedule.cache";

type TimeRange =
  | { mode: "exact"; start: Date; end: Date }
  | { mode: "range"; start: Date; end: Date }
  | { mode: "fromToday"; start: Date };

// Config timezone cho dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const createAppointmentService = async (
  body: CreateAppointmentInput,
  userId: string
): Promise<any> => {
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
    return { success: false, message: "Lịch khám không tồn tại" };
  }

  const { schedule: scheduleArray, doctor } = scheduleResponse.data;

  // Schedule is an array, get the first element
  if (!scheduleArray || scheduleArray.length === 0) {
    return { success: false, message: "Lịch khám không tồn tại" };
  }

  const schedule = scheduleArray[0];

  if (!schedule.isAvailable) {
    return { success: false, message: "Lịch khám không khả dụng" };
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
    return {
      success: false,
      message: "Khung giờ này không có trong lịch khám của bác sĩ",
    };
  }

  // Extract appointment time from timeSlot using dayjs
  const appointmentTime = dayjs(selectedTimeSlot.timeSlot.startTime).format(
    "HH:mm"
  );

  // Check if slot is full
  for (const timeSlot of schedule.timeSlots) {
    if (timeSlot.timeSlotId === parseInt(timeSlotId)) {
      if (timeSlot.currentBooking >= timeSlot.maxBooking) {
        return {
          success: false,
          message: "Khung giờ này đã hết chỗ. Vui lòng chọn khung giờ khác",
        };
      }
    }
  }

  // Validate doctor is approved
  if (!doctor.isApproved) {
    return {
      success: false,
      message: "Bác sĩ chưa được duyệt",
    };
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
      status: {
        in: ["Pending", "Confirmed"],
      },
    },
  });

  if (existingAppointment) {
    return {
      success: false,
      message: "Bạn đã có lịch hẹn này rồi. Vui lòng chọn lịch khác.",
    };
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

  const doctorUserId = await getDoctorUserIdByDoctorIdViaRabbitMQ(
    appointment.doctorId
  );

  await createPaymentDefaultViaRabbitMQ(
    appointment.id,
    String(appointment.totalFee)
  );

  await publishAppointmentCreatedEvent({
    appointmentId: appointment.id,
    doctorId: appointment.doctorId,
    userId: doctorUserId,
    patientName,
    patientPhone,
    patientEmail,
    appointmentDateTime: appointment.appointmentDateTime,
    reason: reason || "Không có lý do cụ thể",
    totalFee: appointment.totalFee,
  });

  await AllAppointmentByDoctorCache.clear();
  await AllWeeklyScheduleCache.clear();

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
const getAppointmentsByUserService = async (
  userId: string,
  page: number,
  pageSize: number,
  status?: string
) => {
  const skip = (page - 1) * pageSize;

  // Build where condition
  const whereCondition: any = { userId };

  // Add status filter if provided and validate
  if (status && status.trim() !== "") {
    const normalizedStatus = status.trim();

    // Map common variants to correct enum values
    const statusMap: Record<string, string> = {
      Cancel: "Cancelled",
      Canceled: "Cancelled",
      Cancelled: "Cancelled",
      Pending: "Pending",
      Confirmed: "Confirmed",
      Completed: "Completed",
    };

    const mappedStatus = statusMap[normalizedStatus] || normalizedStatus;

    // Only add to where condition if it's a valid status
    if (
      ["Pending", "Confirmed", "Cancelled", "Completed"].includes(mappedStatus)
    ) {
      whereCondition.status = mappedStatus;
    }
  }

  // Get total count for pagination
  const totalItems = await prisma.appointment.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(totalItems / pageSize);

  // Get appointments with pagination
  const appointments = await prisma.appointment.findMany({
    where: whereCondition,
    include: {
      patient: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: skip,
    take: pageSize,
  });

  // Fetch schedule and doctor info for each appointment
  const appointmentsWithScheduleInfo = await Promise.all(
    appointments.map(async (appointment) => {
      try {
        const schedule = await checkScheduleViaRabbitMQ(appointment.scheduleId);
        const { schedule: scheduleArray, doctor: doctorArray } = schedule.data;
        return {
          ...appointment,
          schedule: scheduleArray,
          doctor: doctorArray,
        };
      } catch (error) {
        console.error(
          `Error fetching schedule for appointment ${appointment.id}:`,
          error
        );
        return {
          ...appointment,
          schedule: null,
          doctor: null,
        };
      }
    })
  );

  return {
    appointments: appointmentsWithScheduleInfo,
    pagination: {
      currentPage: page,
      pageSize: pageSize,
      totalPages: totalPages,
      totalItems: totalItems,
    },
  };
};

// Get appointment by ID
const getAppointmentByIdService = async (appointmentId: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
    },
  });

  const payment = await getPaymentByAppointmentIdViaRabbitMQ(appointmentId);

  const schedule = await checkScheduleAndTimeslotIdViaRabbitMQ(
    appointment?.scheduleId || "",
    appointment?.timeSlotId || 0
  );

  const doctor = await checkFullDetailDoctorViaRabbitMQ(
    appointment?.doctorId || ""
  );
  const appointmentWithScheduleInfo = {
    ...appointment,
    schedule: schedule,
    doctor: doctor,
    payment: payment,
  };

  return appointmentWithScheduleInfo;
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

  await AllAppointmentByDoctorCache.clear();
  await AllWeeklyScheduleCache.clear();
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
  pageSize: number,
  range: TimeRange,
  status?: string,
  paymentStatus?: string
) => {
  const cacheParams: AllAppointmentByDoctorCacheParams = {
    page,
    pageSize,
    doctorId,
    mode: range.mode,
    startDate: dayjs(range.start).format("YYYY-MM-DD"),
    endDate:
      range.mode !== "fromToday" && "end" in range
        ? dayjs(range.end).format("YYYY-MM-DD")
        : undefined,
    status,
    paymentStatus,
  };

  const cachedAppointments = await AllAppointmentByDoctorCache.get<any>(
    cacheParams
  );

  if (cachedAppointments) {
    return cachedAppointments;
  }

  // Build date condition for query
  let dateCondition: any;
  if (range.mode === "exact") {
    dateCondition = { gte: range.start, lte: range.end };
  } else if (range.mode === "range") {
    dateCondition = { gte: range.start, lte: range.end };
  } else {
    dateCondition = { gte: range.start };
  }

  // Build where condition
  const whereCondition: any = { doctorId };
  whereCondition.appointmentDateTime = dateCondition;

  // Add status filter if provided and valid
  if (status && status.trim() !== "") {
    const normalizedStatus = status.trim();
    whereCondition.status = normalizedStatus;
  }

  // Add paymentStatus filter if provided and valid
  if (paymentStatus && paymentStatus.trim() !== "") {
    const normalizedPaymentStatus = paymentStatus.trim();
    whereCondition.paymentStatus = normalizedPaymentStatus;
  }

  const skip = (page - 1) * pageSize;
   const [appointments, totalAppointments] = await Promise.all([
    prisma.appointment.findMany({
      where: whereCondition,
      include: {
        patient: true,
      },
      skip,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.appointment.count({
      where: whereCondition,
    }),
  ]);

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

  const result = {
    appointments: appointmentsWithScheduleInfo,
    totalAppointments: totalAppointments,
  };

  await AllAppointmentByDoctorCache.set(cacheParams, result);

  return result;
};

const handleCancelAppointment = async (appointmentId: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  // Kiểm tra thời gian hủy - không cho hủy trước 12 tiếng
  const appointmentTime = dayjs(appointment.appointmentDateTime).tz(
    "Asia/Ho_Chi_Minh"
  );
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const hoursDiff = appointmentTime.diff(now, "hour", true);

  if (hoursDiff < 12) {
    throw new Error(
      "Không thể hủy lịch hẹn. Chỉ được hủy trước 12 tiếng so với giờ khám."
    );
  }

  // Kiểm tra trạng thái - chỉ cho phép hủy Pending hoặc Confirmed
  if (appointment.status !== "Pending" && appointment.status !== "Confirmed") {
    throw new Error("Không thể hủy lịch hẹn với trạng thái hiện tại.");
  }

  // 1. Update appointment status
  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: "Cancelled",
    },
  });

  // 2. Release schedule timeslot
  await updateCancelScheduleAndTimeSlotIdViaRabbitMQ(
    appointment.scheduleId,
    String(appointment.timeSlotId)
  );

  // 3. Process payment cancellation and refund
  const cancelPaymentResult =
    await updateCancelPaymentByAppointmentIdViaRabbitMQ(appointment.id);

  // 4. Build response for frontend
  const response = {
    appointment: {
      id: updatedAppointment.id,
      status: updatedAppointment.status,
      appointmentDateTime: updatedAppointment.appointmentDateTime,
      totalFee: Number(updatedAppointment.totalFee),
      updatedAt: updatedAppointment.updatedAt,
    },
    payment: {
      gateway: cancelPaymentResult?.gateway || "UNKNOWN",
      refundProcessed: cancelPaymentResult?.refundProcessed || false,
      refundRequired: cancelPaymentResult?.refundRequired || false,
    },
  };

  await AllAppointmentByDoctorCache.clear();
  await AllWeeklyScheduleCache.clear();

  return response;
};

const handleAppointmentsDisplayScheduleServices = async (doctorId: string) => {
  const cacheParams: AllWeeklyScheduleCacheParams = {
    doctorId,
  };

  const cachedWeeklySchedule = await AllWeeklyScheduleCache.get<{
    appointments: any[];
  }>(cacheParams);

  if (cachedWeeklySchedule) {
    return cachedWeeklySchedule;
  }

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: doctorId, status: "Confirmed" },
    include: {
      patient: true,
    },
    orderBy: {
      appointmentDateTime: "asc",
    },
  });

  await AllWeeklyScheduleCache.set(cacheParams, { appointments });

  return {
    appointments: appointments,
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
  handleCancelAppointment,
  handleAppointmentsDisplayScheduleServices,
};
