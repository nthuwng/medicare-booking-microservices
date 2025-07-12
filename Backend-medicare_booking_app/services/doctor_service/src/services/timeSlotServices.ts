import { CreateTimeSlotData } from "@shared/index";
import { prisma } from "src/config/client";
import { createTimeSlotSchema } from "src/validations/timeSlot.schema";
import dayjs from "dayjs";

const handleCreateTimeSlot = async (body: CreateTimeSlotData) => {
  const result = createTimeSlotSchema.safeParse(body);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((e: any) => e.message)
      .join(", ");
    throw new Error(errorMessages);
  }

  const { startTime, endTime } = result.data;

  if (startTime >= endTime) {
    throw new Error("Thời gian khởi đầu không được lớn hơn thời gian kết thúc");
  }

  const startTimeDate = new Date(`1970-01-01T${startTime}:00Z`);
  const endTimeDate = new Date(`1970-01-01T${endTime}:00Z`);

  const existingSlot = await prisma.timeSlot.findFirst({
    where: {
      startTime: startTimeDate,
      endTime: endTimeDate,
    },
  });

  if (existingSlot) {
    throw new Error("Khung giờ khám đã tồn tại");
  }

  const timeSlot = await prisma.timeSlot.create({
    data: {
      startTime: startTimeDate,
      endTime: endTimeDate,
    },
  });

  return timeSlot;
};

const handleGetAllTimeSlots = async () => {
  const timeSlots = await prisma.timeSlot.findMany();
  const formattedTimeSlots = timeSlots.map((slot) => ({
    id: slot.id,
    startTime: dayjs(slot.startTime).format("HH:mm"),
    endTime: dayjs(slot.endTime).format("HH:mm"),
  }));
  return formattedTimeSlots;
};

export { handleCreateTimeSlot, handleGetAllTimeSlots };
