import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { prisma } from "src/config/client";
import { checkDoctorProfileViaRabbitMQ } from "src/queue/publishers/schedule.publisher";
import { nowVN, nowTimeStr, todayStr, todayVN } from "src/utils/time";

dayjs.extend(utc);
dayjs.extend(timezone);

const createSchedule = async (
  doctorId: string,
  date: string,
  clinicId: number
) => {
  return await prisma.schedule.create({
    data: {
      doctorId,
      date: new Date(date),
      clinicId,
      isAvailable: true,
    },
  });
};

const getScheduleByDoctorId = async (
  doctorId: string,
  dateFilter?: string,
  fromDate?: string,
  toDate?: string
) => {
  // Xử lý filter theo ngày
  let dateCondition: any = { gte: todayVN().toDate() };

  if (dateFilter) {
    // Filter theo ngày cụ thể
    const filterDate = dayjs(dateFilter).tz("Asia/Ho_Chi_Minh").startOf("day");
    const nextDay = filterDate.add(1, "day").startOf("day");

    dateCondition = {
      gte: filterDate.toDate(),
      lt: nextDay.toDate(),
    };
  } else if (fromDate && toDate) {
    // Filter theo khoảng ngày
    const from = dayjs(fromDate).tz("Asia/Ho_Chi_Minh").startOf("day");
    const to = dayjs(toDate).tz("Asia/Ho_Chi_Minh").endOf("day");

    dateCondition = {
      gte: from.toDate(),
      lte: to.toDate(),
    };
  } else if (fromDate) {
    // Chỉ có from date
    const from = dayjs(fromDate).tz("Asia/Ho_Chi_Minh").startOf("day");
    dateCondition = { gte: from.toDate() };
  } else if (toDate) {
    // Chỉ có to date
    const to = dayjs(toDate).tz("Asia/Ho_Chi_Minh").endOf("day");
    dateCondition = { lte: to.toDate() };
  }

  const schedules = await prisma.schedule.findMany({
    where: {
      doctorId,
      date: dateCondition,
      timeSlots: { some: { status: "OPEN" } },
    },
    include: {
      timeSlots: {
        where: { status: "OPEN" },
        include: { timeSlot: true },
        orderBy: { timeSlot: { startTime: "asc" } },
      },
    },
    orderBy: { date: "asc" },
  });

  const now = nowVN();
  const cleaned = schedules
    .map((sch) => {
      const dateStr = dayjs(sch.date).format("YYYY-MM-DD");
      const dateVN = dayjs(sch.date).format("DD/MM/YYYY"); // format cho UI
      sch.date = dateVN as any;
      const validSlots = sch.timeSlots.filter((st) => {
        const endStr = dayjs(st.timeSlot.endTime).format("HH:mm:ss");
        const endDT = dayjs.tz(
          `${dateStr} ${endStr}`,
          "YYYY-MM-DD HH:mm:ss",
          "Asia/Ho_Chi_Minh"
        );
        const expired = endDT.isBefore(now);
        const full = st.currentBooking >= st.maxBooking;
        return !expired && !full;
      });

      const formattedSlots = validSlots.map((ts) => ({
        ...ts,
        timeSlot: {
          ...ts.timeSlot,
          startTime: dayjs(ts.timeSlot.startTime).format("HH:mm"),
          endTime: dayjs(ts.timeSlot.endTime).format("HH:mm"),
        },
      }));

      return { ...sch, timeSlots: formattedSlots };
    })
    .filter((sch) => sch.timeSlots.length > 0);

  return cleaned;
};

const getScheduleByScheduleId = async (scheduleId: string) => {
  const schedule = await prisma.schedule.findMany({
    where: { id: scheduleId },
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

const getScheduleByScheduleIdAndTimeSlotId = async (
  scheduleId: string,
  timeSlotId: number
) => {
  const schedule = await prisma.schedule.findFirst({
    where: { id: scheduleId },
    include: {
      timeSlots: {
        where: { timeSlotId: timeSlotId },
        include: {
          timeSlot: true,
        },
      },
    },
  });
  return schedule;
};

const updateTimeSlotByScheduleIdAndTimeSlotId = async (
  scheduleId: string,
  timeSlotId: number
) => {
  const checkSchedule = await prisma.scheduleTimeSlot.findFirst({
    where: { scheduleId: scheduleId, timeSlotId: +timeSlotId },
  });

  if (!checkSchedule?.timeSlotId) {
    throw new Error("Time slot not found");
  }

  if (checkSchedule.currentBooking >= checkSchedule.maxBooking) {
    throw new Error("Time slot is full");
  }

  const schedule = await prisma.scheduleTimeSlot.update({
    where: { scheduleId_timeSlotId: { scheduleId, timeSlotId: +timeSlotId } },
    data: { currentBooking: { increment: 1 } },
  });

  return schedule;
};

const updateCancelTimeSlotByScheduleIdAndTimeSlotId = async (
  scheduleId: string,
  timeSlotId: number
) => {
  const checkSchedule = await prisma.scheduleTimeSlot.findFirst({
    where: { scheduleId: scheduleId, timeSlotId: +timeSlotId },
  });
  if (!checkSchedule?.timeSlotId) {
    throw new Error("Time slot not found");
  }
  if (checkSchedule.currentBooking <= 0) {
    throw new Error("Current booking is already zero");
  }
  const schedule = await prisma.scheduleTimeSlot.update({
    where: { scheduleId_timeSlotId: { scheduleId, timeSlotId: +timeSlotId } },
    data: { currentBooking: { decrement: 1 } },
  });
  return schedule;
};

export {
  createSchedule,
  getScheduleByDoctorId,
  getScheduleByScheduleId,
  updateTimeSlotByScheduleIdAndTimeSlotId,
  getScheduleByScheduleIdAndTimeSlotId,
  updateCancelTimeSlotByScheduleIdAndTimeSlotId,
};
