import { prisma } from "src/config/client";
import { getClinicByHospitalIdViaRabbitMQ } from "src/queue/publishers/payment.publisher";

const handleGetAllPayments = async () => {
  // Logic to get all payments
  const payments = await prisma.payment.findMany({
    where: { state: "PAID" },
    select: {
      amount: true,
      gateway: true,
      hospitalId: true,
    },
  });
  const revenueMap: { [key: string]: any } = {};

  for (const p of payments) {
    if (!revenueMap[p.hospitalId]) {
      revenueMap[p.hospitalId] = {
        hospitalId: p.hospitalId,
        VNPAY: { totalAmount: 0, count: 0 },
        CASH: { totalAmount: 0, count: 0 },
      };
    }

    revenueMap[p.hospitalId][p.gateway].totalAmount += p.amount;
    revenueMap[p.hospitalId][p.gateway].count += 1;
  }

  const hospitalIds = Object.keys(revenueMap);

  const clinics = await getClinicByHospitalIdViaRabbitMQ(payments);

  const clinicMap: { [key: string]: any } = {};
  clinics.forEach((c: any) => {
    clinicMap[String(c.id)] = c;
  });

  const result = hospitalIds.map((id) => ({
    hospitalId: id,
    clinicInfo: clinicMap[id] || null,
    revenue: {
      vnpay: revenueMap[id].VNPAY,
      cash: revenueMap[id].CASH,
      total: revenueMap[id].VNPAY.totalAmount + revenueMap[id].CASH.totalAmount,
    },
  }));

  return result;
};

export { handleGetAllPayments };
