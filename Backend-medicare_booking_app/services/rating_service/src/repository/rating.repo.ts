import { prisma } from "src/config/client";

const getRatingByDoctorId = async (doctorId: string) => {
  const rating = await prisma.rating.findMany({
    where: {
      doctorId,
    },
  });
  return rating;
};

export { getRatingByDoctorId };
