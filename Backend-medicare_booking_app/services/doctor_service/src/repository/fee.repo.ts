import { prisma } from "src/config/client";

const createFee = async (
  clinicId: number,
  consultationFee: number,
  bookingFee: number,
  doctorProfileId: string
) => {
  return await prisma.fee.create({
    data: {
      clinicId: +clinicId,
      consultationFee: consultationFee,
      bookingFee: bookingFee,
      doctorId: doctorProfileId,
    },
  });
};

const getFee = async (doctorProfileId: string) => {
  return await prisma.fee.findFirst({
    where: {
      doctorId: doctorProfileId,
    },
    include: {
      clinic: true,
    },
  });
};

export { createFee, getFee };
