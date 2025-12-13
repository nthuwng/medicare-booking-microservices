import { Request, Response } from "express";
import { handleGetAllPayments } from "src/services/paymentService";

const getAllPayments = async (req: Request, res: Response) => {
  // Logic to get all payments
  const payments = await handleGetAllPayments();

  res.status(200).json({
    message: "Get all payments successfully",
    data: payments,
  });
};

export { getAllPayments };
