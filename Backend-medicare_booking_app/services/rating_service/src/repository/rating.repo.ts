import { prisma } from "src/config/client";
import { checkFullDetailDoctorViaRabbitMQ } from "src/queue/publishers/rating.publisher";
import { getUserProfileByUserIdViaRabbitMQ } from "src/queue/publishers/rating.publisher";

const getRatingByDoctorId = async (doctorId: string) => {
  const rating = await prisma.rating.findMany({
    where: {
      doctorId,
    },
  });
  return rating;
};

const getRatingStatsByDoctorId = async (doctorId: string) => {
  const ratingStats = await prisma.doctorRatingStat.findUnique({
    where: { doctorId },
  });

  return ratingStats;
};

export { getRatingByDoctorId, getRatingStatsByDoctorId };
