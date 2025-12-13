import { Request, Response } from "express";
import { handleGetAllPayments } from "src/services/paymentService";

const getAllPayments = async (req: Request, res: Response) => {
  try {
    const { page, pageSize } = req.query;
    let currentPage = page ? +page : 1;
    if (currentPage <= 0) {
      currentPage = 1;
    }

    const size = Math.max(1, Math.min(100, Number(pageSize) || 10));

    const { payments, totalItems } = await handleGetAllPayments(
      currentPage,
      parseInt(pageSize as string)
    );

    const pages = Math.max(1, Math.ceil(totalItems / size));

    if (!payments) {
      res.status(200).json({
        success: true,
        message: "Không có  thanh toán nào trong trang này",
        data: {
          meta: {
            currentPage: currentPage,
            pageSize: parseInt(pageSize as string),
            pages: pages,
            total: totalItems,
          },
          result: [],
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      length: totalItems,
      message: "Get all payments successfully",
      data: {
        meta: {
          currentPage: currentPage,
          pageSize: parseInt(pageSize as string),
          pages: pages,
          total: totalItems,
        },
        result: payments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export { getAllPayments };
