// src/services/scheduleService.ts (hoặc đường dẫn tương tự của bạn)

import { CreateScheduleData } from "@shared/interfaces/schedule/ISchedule";
import dayjs from "dayjs";
import { prisma } from "src/config/client";
import { createSchedule } from "src/repository/schedule.repo";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Config timezone cho dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const scheduleService = async (body: CreateScheduleData) => {
  const { doctorId, date, timeSlotId, clinicId } = body;

  const checkClinic = await prisma.clinic.findUnique({
    where: { id: +clinicId },
  });
  if (!checkClinic) {
    throw new Error("Phòng khám không tồn tại.");
  }

  const checkDoctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });
  if (!checkDoctor) {
    throw new Error("Bác sĩ không tồn tại.");
  }

  // Kiểm tra và validate các time slots
  const timeSlotIds = Array.isArray(timeSlotId) ? timeSlotId : [timeSlotId];
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const today = now.startOf("day");
  const selectedDay = dayjs(date).tz("Asia/Ho_Chi_Minh").startOf("day");

  if (selectedDay.isBefore(today)) {
    throw new Error("Vui lòng chọn ngày trong tương lai.");
  }

  const formatToday = today.format("YYYY-MM-DD");
  const formatSelectedDay = selectedDay.format("YYYY-MM-DD");
  const hoursToday = now.format("HH:mm");

  // Validate từng time slot
  for (const id of timeSlotIds) {
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: +id },
      select: { startTime: true, endTime: true },
    });

    if (!timeSlot) {
      throw new Error(`Khung giờ với id ${id} không tồn tại.`);
    }

    const timeSlotStartTime = dayjs(timeSlot.startTime).format("HH:mm");
    if (formatToday === formatSelectedDay && timeSlotStartTime < hoursToday) {
      throw new Error(
        `Khung giờ ${timeSlotStartTime} đã qua, vui lòng chọn khung giờ trong tương lai.`
      );
    }
  }
  // Tìm tất cả schedule của bác sĩ tại phòng khám trong ngày đó
  const existingSchedules = await prisma.schedule.findMany({
    where: {
      doctorId,
      clinicId: +clinicId,
      date: {
        gte: new Date(formatSelectedDay + "T00:00:00.000Z"),
        lt: new Date(formatSelectedDay + "T23:59:59.999Z"),
      },
    },
    include: {
      timeSlots: {
        include: {
          timeSlot: true,
        },
      },
    },
  });

  // Kiểm tra xem có time slot nào bị trùng lặp không
  const existingTimeSlotIds = existingSchedules.flatMap((schedule) =>
    schedule.timeSlots.map((ts) => ts.timeSlotId)
  );

  const duplicateTimeSlots = timeSlotIds.filter((id) =>
    existingTimeSlotIds.includes(+id)
  );

  if (duplicateTimeSlots.length > 0) {
    throw new Error(
      "Bạn đã chọn khung giờ trùng lặp, vui lòng chọn khung giờ khác."
    );
  }

  // Tạo schedule hoặc sử dụng schedule đã tồn tại
  let schedule;
  if (existingSchedules.length > 0) {
    // Sử dụng schedule đã tồn tại
    schedule = existingSchedules[0];
    console.log("Using existing schedule:", schedule.id);
  } else {
    // Tạo schedule mới
    schedule = await createSchedule(doctorId, formatSelectedDay, +clinicId);
    console.log("Created new schedule:", schedule.id);
  }

  // Tạo các bản ghi schedule_time_slots
  const scheduleTimeSlots = [];
  for (const id of timeSlotIds) {
    const scheduleTimeSlot = await prisma.scheduleTimeSlot.create({
      data: {
        scheduleId: schedule.id,
        timeSlotId: +id,
        maxBooking: 3, // Mặc định tối đa 3 người/slot
        currentBooking: 0, // Chưa có ai đặt
      },
      include: {
        timeSlot: {
          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    // Format thời gian chỉ hiển thị HH:mm
    const formattedTimeSlot = {
      ...scheduleTimeSlot,
      timeSlot: {
        startTime: dayjs(scheduleTimeSlot.timeSlot.startTime).format("HH:mm"),
        endTime: dayjs(scheduleTimeSlot.timeSlot.endTime).format("HH:mm"),
      },
    };

    scheduleTimeSlots.push(formattedTimeSlot);
  }

  return {
    schedule,
    timeSlots: scheduleTimeSlots,
    message: `Đã tạo thành công lịch khám`,
  };
};

const handleGetSchedule = async (page: number, pageSize: number) => {
  const skip = (page - 1) * pageSize;
  const schedules = await prisma.schedule.findMany({
    include: {
      doctor: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          title: true,
          avatarUrl: true,
        },
      },
      clinic: {
        select: {
          id: true,
          clinicName: true,
          city: true,
          district: true,
          street: true,
          phone: true,
        },
      },
      timeSlots: {
        include: {
          timeSlot: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      },
    },
    skip,
    take: pageSize,
  });

  // Format thời gian sau khi lấy dữ liệu
  const formattedSchedules = schedules.map((schedule) => ({
    ...schedule,
    timeSlots: schedule.timeSlots.map((ts) => ({
      ...ts,
      timeSlot: {
        ...ts.timeSlot,
        startTime: dayjs(ts.timeSlot.startTime).format("HH:mm"),
        endTime: dayjs(ts.timeSlot.endTime).format("HH:mm"),
      },
    })),
  }));

  return {
    schedules: formattedSchedules,
    totalSchedules: formattedSchedules.length,
  };
};

const countTotalSchedulePage = async (pageSize: number) => {
  const totalItems = await prisma.schedule.count();

  const totalPages = Math.ceil(totalItems / pageSize);

  return totalPages;
};

export { scheduleService, handleGetSchedule,countTotalSchedulePage };
