import { z } from "zod";

// Regex kiểm tra định dạng HH:mm
const timeRegex = /^\d{2}:\d{2}$/;

export const createTimeSlotSchema = z.object({
  startTime: z
    .string()
    .regex(timeRegex, {
      message: "Thời gian bắt đầu phải đúng định dạng HH:mm",
    })
    .refine(
      (val) => {
        const [hour, minute] = val.split(":").map(Number);
        return hour >= 0 && hour < 24 && minute >= 0 && minute < 60;
      },
      { message: "Thời gian bắt đầu không hợp lệ" }
    ),

  endTime: z
    .string()
    .regex(timeRegex, {
      message: "Thời gian kết thúc phải đúng định dạng HH:mm",
    })
    .refine(
      (val) => {
        const [hour, minute] = val.split(":").map(Number);
        return hour >= 0 && hour < 24 && minute >= 0 && minute < 60;
      },
      { message: "Thời gian kết thúc không hợp lệ" }
    ),
});
