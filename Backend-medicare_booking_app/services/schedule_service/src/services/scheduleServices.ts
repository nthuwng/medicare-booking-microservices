// src/services/scheduleService.ts (hoặc đường dẫn tương tự của bạn)

import { CreateScheduleData } from "@shared/interfaces/schedule/ISchedule";
import dayjs from "dayjs";
import { prisma } from "src/config/client";
import { createSchedule } from "src/repository/schedule.repo";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  checkClinicViaRabbitMQ,
  checkDoctorProfileViaRabbitMQ,
} from "src/queue/publishers/schedule.publisher";
import { todayStr, nowTimeStr } from "src/utils/time";

type TimeRange =
  | { mode: "exact"; start: Date; end: Date }
  | { mode: "range"; start: Date; end: Date }
  | { mode: "fromToday"; start: Date };

// Config timezone cho dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const scheduleService = async (body: CreateScheduleData) => {
  const { doctorId, date, timeSlotId, clinicId } = body;

  const checkDoctor = await checkDoctorProfileViaRabbitMQ(doctorId);

  if (!checkDoctor) {
    throw new Error("Bác sĩ không tồn tại.");
  }

  if (checkDoctor.isApproved === false) {
    throw new Error("Bác sĩ chưa được phê duyệt. Vui lòng đợi phê duyệt.");
  }

  const checkClinic = await checkClinicViaRabbitMQ(clinicId.toString());
  if (!checkClinic) {
    throw new Error("Phòng khám không tồn tại.");
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
  } else {
    // Tạo schedule mới
    schedule = await createSchedule(doctorId, formatSelectedDay, +clinicId);
  }

  if (!schedule) {
    throw new Error("Không thể tạo hoặc lấy schedule");
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

const handleGetAllSchedule = async (page: number, pageSize: number) => {
  const skip = (page - 1) * pageSize;

  const schedules = await prisma.schedule.findMany({
    include: {
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

  // Lấy thông tin doctor profile cho mỗi schedule
  const schedulesWithDoctorInfo = await Promise.all(
    schedules.map(async (schedule) => {
      try {
        // Lấy thông tin doctor qua RabbitMQ
        const doctorProfile = await checkDoctorProfileViaRabbitMQ(
          schedule.doctorId
        );

        // Lấy thông tin clinic qua RabbitMQ
        const clinicInfo = await checkClinicViaRabbitMQ(
          schedule.clinicId.toString()
        );

        return {
          ...schedule,
          doctorProfile: doctorProfile || null,
          clinicInfo: clinicInfo || null,
          timeSlots: schedule.timeSlots.map((ts) => ({
            ...ts,
            timeSlot: {
              ...ts.timeSlot,
              startTime: dayjs(ts.timeSlot.startTime).format("HH:mm"),
              endTime: dayjs(ts.timeSlot.endTime).format("HH:mm"),
            },
          })),
        };
      } catch (error) {
        console.error(
          `Error fetching doctor/clinic info for schedule ${schedule.id}:`,
          error
        );
      }
    })
  );

  return {
    schedules: schedulesWithDoctorInfo,
    totalSchedules: schedulesWithDoctorInfo.length,
  };
};
const countTotalSchedulePage = async (pageSize: number) => {
  const totalItems = await prisma.schedule.count();

  const totalPages = Math.ceil(totalItems / pageSize);

  return totalPages;
};

const getScheduleByDoctorId = async (doctorId: string, range: TimeRange) => {
  let dateCondition: any;

  if (range.mode === "exact") {
    // Tìm trong 1 ngày (>= start và < end+1ms)
    dateCondition = { gte: range.start, lte: range.end };
  } else if (range.mode === "range") {
    dateCondition = { gte: range.start, lte: range.end };
  } else {
    // từ hôm nay
    dateCondition = { gte: range.start };
  }

  const schedule = await prisma.schedule.findMany({
    where: { doctorId, date: dateCondition },
    orderBy: [{ date: "asc" }],
    include: {
      timeSlots: {
        include: {
          timeSlot: true,
        },
      },
    },
  });

  // Format lại giờ hiển thị
  const filtered = schedule.map((s) => ({
    ...s,
    timeSlots: s.timeSlots.map((ts) => ({
      ...ts,
      timeSlot: {
        ...ts.timeSlot,
        startTime: dayjs(ts.timeSlot.startTime).format("HH:mm"),
        endTime: dayjs(ts.timeSlot.endTime).format("HH:mm"),
      },
    })),
  }));

  return filtered;
};

const getScheduleById = async (id: string) => {
  const schedule = await prisma.schedule.findMany({
    where: { doctorId: id },
    include: {
      timeSlots: {
        include: {
          timeSlot: true,
        },
      },
    },
  });
  const doctor = await checkDoctorProfileViaRabbitMQ(
    schedule[0]?.doctorId || ""
  );

  return { data: { schedule, doctor } };
};

const updateExpiredTimeSlots = async () => {
  const today = todayStr();
  const currentTime = nowTimeStr();

  // 1. Tìm tất cả time slots có ngày < hôm nay
  const pastDateSlots = await prisma.scheduleTimeSlot.findMany({
    where: {
      status: "OPEN",
      schedule: {
        date: {
          lt: new Date(`${today}T00:00:00.000Z`),
        },
      },
    },
    include: {
      schedule: true,
      timeSlot: true,
    },
  });

  // 2. Tìm tất cả time slots hôm nay đã qua giờ
  const todayExpiredSlots = await prisma.scheduleTimeSlot.findMany({
    where: {
      status: "OPEN",
      schedule: {
        date: {
          gte: new Date(`${today}T00:00:00.000Z`),
          lt: new Date(`${today}T23:59:59.999Z`),
        },
      },
    },
    include: {
      schedule: true,
      timeSlot: true,
    },
  });

  // Lọc các slot hôm nay đã qua giờ
  const expiredTodaySlots = todayExpiredSlots.filter((slot) => {
    const endTime = dayjs(slot.timeSlot.endTime).format("HH:mm:ss");
    return endTime <= currentTime;
  });

  // 3. Gộp tất cả slots cần update
  const allExpiredSlots = [...pastDateSlots, ...expiredTodaySlots];

  if (allExpiredSlots.length === 0) {
    return {
      message: "Không có time slot nào cần cập nhật",
      updated: 0,
    };
  }

  // 4. Update status thành EXPIRED
  const updatePromises = allExpiredSlots.map((slot) =>
    prisma.scheduleTimeSlot.update({
      where: {
        scheduleId_timeSlotId: {
          scheduleId: slot.scheduleId,
          timeSlotId: slot.timeSlotId,
        },
      },
      data: {
        status: "EXPIRED",
      },
    })
  );

  await Promise.all(updatePromises);

  return {
    message: `Đã cập nhật ${allExpiredSlots.length} time slot thành hết hạn`,
    updated: allExpiredSlots.length,
    details: allExpiredSlots.map((slot) => ({
      scheduleId: slot.scheduleId,
      timeSlotId: slot.timeSlotId,
      date: slot.schedule.date,
      timeRange: `${dayjs(slot.timeSlot.startTime).format("HH:mm")} - ${dayjs(
        slot.timeSlot.endTime
      ).format("HH:mm")}`,
    })),
  };
};

const deleteScheduleByScheduleId = async (scheduleId: string) => {
  try {
    // Kiểm tra xem schedule có tồn tại không
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new Error("Lịch khám không tồn tại");
    }

    // Kiểm tra xem có booking nào đang chờ xác nhận hoặc đã xác nhận không
    const timeSlots = await prisma.scheduleTimeSlot.findMany({
      where: { scheduleId },
    });

    // Kiểm tra xem có time slot nào đã có booking không
    const hasBookings = timeSlots.some((slot) => slot.currentBooking > 0);

    if (hasBookings) {
      throw new Error("Không thể xóa lịch khám đã có bệnh nhân đặt lịch");
    }

    // Sử dụng transaction để xóa an toàn
    const result = await prisma.$transaction(async (tx) => {
      // Xóa tất cả time slots trước
      await tx.scheduleTimeSlot.deleteMany({
        where: { scheduleId },
      });

      // Xóa schedule
      await tx.schedule.delete({
        where: { id: scheduleId },
      });

      return { success: true, message: "Xóa lịch khám thành công" };
    });

    return result;
  } catch (error: any) {
    console.error("Error deleting schedule:", error);
    throw new Error(error.message || "Lỗi khi xóa lịch khám");
  }
};

const deleteScheduleByTimeSlotId = async (
  timeSlotId: string,
  scheduleId: string
) => {
  try {
    // Kiểm tra xem schedule có tồn tại không
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new Error("Lịch khám không tồn tại");
    }

    // Kiểm tra xem time slot cụ thể có tồn tại trong schedule không
    const scheduleTimeSlot = await prisma.scheduleTimeSlot.findFirst({
      where: {
        timeSlotId: +timeSlotId,
        scheduleId: scheduleId,
      },
    });

    if (!scheduleTimeSlot) {
      throw new Error("Time slot không tồn tại trong lịch khám này");
    }

    // Kiểm tra xem time slot này có currentBooking > 0 không
    if (scheduleTimeSlot.currentBooking > 0) {
      throw new Error("Không thể xóa time slot đã có bệnh nhân đặt lịch");
    }

    // Xóa time slot cụ thể
    await prisma.scheduleTimeSlot.delete({
      where: {
        scheduleId_timeSlotId: {
          scheduleId: scheduleId,
          timeSlotId: +timeSlotId,
        },
      },
    });

    // Nếu schedule không còn time slot nào -> xóa luôn schedule để tránh rác
    const remainingSlots = await prisma.scheduleTimeSlot.count({
      where: { scheduleId },
    });

    if (remainingSlots === 0) {
      await prisma.schedule.delete({ where: { id: scheduleId } });
      return {
        success: true,
        message:
          "Xóa time slot thành công và đã xóa luôn lịch vì không còn khung giờ",
      };
    }

    return { success: true, message: "Xóa time slot thành công" };
  } catch (error: any) {
    console.error("Error deleting time slot:", error);
    throw new Error(error.message || "Lỗi khi xóa time slot");
  }
};

export {
  scheduleService,
  countTotalSchedulePage,
  getScheduleByDoctorId,
  handleGetAllSchedule,
  getScheduleById,
  updateExpiredTimeSlots,
  deleteScheduleByScheduleId,
  deleteScheduleByTimeSlotId,
};
