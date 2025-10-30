import { Request, Response } from "express";
import {
  handleCreateRating,
  handleGetRatingById,
  handleGetRatingByDoctorId,
  countTotalDoctorRatingStatPage,
  handleGetAllTopRateDoctorRatingStat,
} from "../services/rating.service";

const getRatingByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const rating = await handleGetRatingById(id);
  res.status(200).json({
    success: true,
    message: "Rating fetched successfully",
    data: rating,
  });
};

const createRatingController = async (req: Request, res: Response) => {
  const { doctorId, score, content } = req.body;

  const userId = req.user?.userId || "";
  const newRating = await handleCreateRating(doctorId, +score, content, userId);
  if (!newRating) {
    res.status(400).json({ success: false, message: "Đánh giá thất bại" });
  }
  res.status(201).json({
    success: true,
    message: "Đánh giá thành công",
    data: newRating,
  });
};

const getRatingByDoctorIdController = async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const rating = await handleGetRatingByDoctorId(doctorId);
  res.status(200).json({
    success: true,
    length: rating.ratings.length,
    message: "Rating fetched successfully",
    data: rating,
  });
};

const getTopRateDoctorsController = async (req: Request, res: Response) => {
  const { page, pageSize } = req.query;
  let currentPage = page ? +page : 1;
  if (currentPage <= 0) {
    currentPage = 1;
  }
  const totalPages = await countTotalDoctorRatingStatPage(
    parseInt(pageSize as string)
  );
  const { doctors, totalDoctors } = await handleGetAllTopRateDoctorRatingStat(
    currentPage,
    parseInt(pageSize as string)
  );
  if (doctors.length === 0) {
    res.status(200).json({
      success: true,
      message: "Không có thông tin đánh giá nào của bác sĩ nào trong trang này",
      data: {
        meta: {
          current: currentPage,
          pageSize: parseInt(pageSize as string),
          pages: totalPages,
          total: totalDoctors, // total across all pages
        },
        result: [],
      },
    });
    return;
  }
  res.status(200).json({
    success: true,
    length: doctors.length,
    message: "Lấy danh sách bác sĩ đánh giá cao thành công",
    data: {
      meta: {
        current: currentPage,
        pageSize: parseInt(pageSize as string),
        pages: totalPages,
        total: totalDoctors, // total across all pages
      },
      result: doctors,
    },
  });
};
export {
  getRatingByIdController,
  createRatingController,
  getRatingByDoctorIdController,
  getTopRateDoctorsController,
};
