import { CreateScheduleData } from "@shared/interfaces/schedule/ISchedule";
import { createSchedule } from "src/repository/schedule.repo";

const scheduleService = async (body: CreateScheduleData) => {
  const { doctorId, date, startTime, endTime, isAvailable, clinicId } = body;

  // Parse date - hỗ trợ nhiều format từ frontend
  let parsedDate: string;
  if (typeof date === "string") {
    // Nếu là string, kiểm tra format
    if (date.includes("T")) {
      // ISO string: "2024-01-15T00:00:00.000Z" -> "2024-01-15"
      parsedDate = date.split("T")[0];
    } else {
      // Đã đúng format: "2024-01-15"
      parsedDate = date;
    }
  } else if (date instanceof Date) {
    // Nếu là Date object
    parsedDate = date.toISOString().split("T")[0];
  } else if (typeof date === "number") {
    // Nếu là timestamp
    parsedDate = new Date(date).toISOString().split("T")[0];
  } else {
    throw new Error("Invalid date format");
  }

  // Parse dữ liệu đúng kiểu
  const parsedIsAvailable =
    typeof isAvailable === "string"
      ? isAvailable === "true" || isAvailable === "1"
      : Boolean(isAvailable);

  const parsedClinicId =
    typeof clinicId === "string" ? parseInt(clinicId) : Number(clinicId);

  // Validate date không được trong quá khứ
  const scheduleDate = new Date(parsedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (scheduleDate < today) {
    throw new Error("Cannot create schedule for past dates");
  }

  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new Error("Invalid time format. Use HH:MM:SS");
  }

  // Validate start time < end time
  const startTimeDate = new Date(`1970-01-01T${startTime}Z`);
  const endTimeDate = new Date(`1970-01-01T${endTime}Z`);
  if (startTimeDate >= endTimeDate) {
    throw new Error("Start time must be before end time");
  }

  const schedule = await createSchedule(
    doctorId,
    parsedDate,
    startTime,
    endTime,
    parsedIsAvailable,
    parsedClinicId
  );
  return schedule;
};

export default scheduleService;
