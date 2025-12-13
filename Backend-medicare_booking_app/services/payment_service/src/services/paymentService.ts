import { prisma } from "src/config/client";

const handleGetAllPayments = async () => {
  // Logic to get all payments
  const payments = await prisma.payment.findMany();
  console.log("Payments:", payments);

  return payments;
};

export { handleGetAllPayments };
