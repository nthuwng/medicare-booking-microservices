import { prisma } from "src/config/client";

const createSchedule = async (
  doctorId: string,
  date: string,
  startTime: string,
  endTime: string,
  isAvailable: boolean,
  clinicId: number
) => {
  return await prisma.schedule.create({
    data: {
      doctorId,
      date: new Date(date),
      startTime: new Date(`1970-01-01T${startTime}Z`),
      endTime: new Date(`1970-01-01T${endTime}Z`),
      isAvailable,
      clinicId,
    },
    include: {
      doctor: {
        select: {
          id: true,
          fullName: true,
          phone: true,
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
    },
  });
};

const getScheduleByDoctorId = async (doctorId: string) => {
  return await prisma.schedule.findMany({
    where: {
      doctorId,
    },
    include: {
      doctor: {
        select: {
          id: true,
          fullName: true,
          phone: true,
        },
      },
    },
  });
};

export { createSchedule, getScheduleByDoctorId };
