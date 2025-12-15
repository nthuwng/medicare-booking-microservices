import { Request, Response } from "express";
import { handleGetAllPayments } from "src/services/paymentService";

const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await handleGetAllPayments();

    if (!payments) {
      res.status(200).json({
        success: true,
        lenght: 0,
        message: "Không có  thanh toán nào trong trang này",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      length: payments.length,
      message: "Get all payments successfully",
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export { getAllPayments };
