import { Prisma } from "@prisma/client";
import { prisma } from "src/config/client";
import { getUserProfileByUserIdViaRabbitMQ } from "src/queue/publishers/rating.publisher";

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

  await prisma.$transaction(async (tx) => {
    const stat = await tx.doctorRatingStat.upsert({
      where: { doctorId },
      create: {
        doctorId,
        avgScore: new Prisma.Decimal(score),
        totalReviews: 0,
        lastReviewAt: new Date(),
      },
      update: {},
    });

    const prevTotal = stat.totalReviews;
    const prevAvg = new Prisma.Decimal(stat.avgScore);
    const newTotal = prevTotal + 1;
    const newAvg = prevAvg
      .mul(prevTotal)
      .add(score)
      .div(newTotal)
      .toDecimalPlaces(1);

    await tx.doctorRatingStat.update({
      where: { doctorId },
      data: {
        totalReviews: newTotal,
        avgScore: newAvg,
        lastReviewAt: new Date(),
      },
    });
  });

  return newRating;
};

const handleGetRatingByDoctorId = async (doctorId: string) => {
  const ratingList = await prisma.rating.findMany({
    where: { doctorId },
    orderBy: { createdAt: "desc" },
  });

  const ratings = await Promise.all(
    ratingList.map(async (r) => {
      const userProfile = await getUserProfileByUserIdViaRabbitMQ(r.userId);
      return { ...r, userProfile };
    })
  );

  const ratingStats = await prisma.doctorRatingStat.findUnique({
    where: { doctorId },
  });

  return { ratings, ratingStats };
};

export { handleCreateRating, handleGetRatingById, handleGetRatingByDoctorId };
