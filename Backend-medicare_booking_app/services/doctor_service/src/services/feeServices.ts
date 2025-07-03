import { prisma } from "src/config/client";
import { CreateFeeData } from "@shared/index";
import { createFee, getFee } from "src/repository/fee.repo";

const createFeeService = async (
  body: CreateFeeData,
  doctorProfileId: string
) => {
  const { clinicId, consultationFee, bookingFee } = body;

  const clinic = await prisma.clinic.findFirst({
    where: {
      id: +clinicId,
    },
  });

  if (!clinic) {
    throw new Error("Clinic not found");
  }

  const doctor = await prisma.doctor.findUnique({
    where: {
      id: doctorProfileId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const fee = await createFee(
    clinicId,
    consultationFee,
    bookingFee,
    doctorProfileId
  );
  return fee;
};

const getFeeService = async (doctorProfileId: string) => {
  const fee = await getFee(doctorProfileId);
  if (!fee) {
    throw new Error("Fee not found");
  }
  return fee;
};

export { createFeeService, getFeeService };
