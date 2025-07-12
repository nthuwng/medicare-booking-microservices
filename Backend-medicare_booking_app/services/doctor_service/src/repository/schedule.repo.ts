import { prisma } from "src/config/client";

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

const getScheduleById = async (scheduleId: string) => {
  return await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: {
      doctor: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          gender: true,
          avatarUrl: true,
          title: true,
          approvalStatus: true,
          experienceYears: true,
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

export { createSchedule, getScheduleByDoctorId, getScheduleById };
