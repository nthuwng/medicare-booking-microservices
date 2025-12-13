import { prisma } from "src/config/client";

const handleGetAllPayments = async (page: number, pageSize: number) => {
  const skip = (page - 1) * pageSize;
  // Logic to get all payments
  //   const payments = await prisma.payment.findMany();

  const [payments, totalItems] = await Promise.all([
    prisma.payment.findMany({
      skip: skip,
      take: pageSize,
    }),
    prisma.payment.count(),
  ]);

  const results = { payments, totalItems };

  return results;
};

export { handleGetAllPayments };
