import { prisma } from "src/config/client";

const handleGetRatingById = async (id: string) => {
  const rating = await prisma.rating.findUnique({
    where: {
      id,
    },
  });
  return rating;
};

const handleCreateRating = async (
  doctorId: string,
  score: number,
  content: string,
  userId: string
) => {
  const newRating = await prisma.rating.create({
    data: {
      doctorId,
      score,
      content,
      userId: userId,
    },
  });
  return newRating;
};

const handleGetRatingByDoctorId = async (doctorId: string) => {
  const rating = await prisma.rating.findMany({
    where: {
      doctorId,
    },
  });
  return rating;
};

export { handleCreateRating, handleGetRatingById ,handleGetRatingByDoctorId};
