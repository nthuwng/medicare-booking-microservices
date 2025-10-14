import { Request, Response } from "express";
import {
  handleCreateRating,
  handleGetRatingById,
  handleGetRatingByDoctorId,
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

export {
  getRatingByIdController,
  createRatingController,
  getRatingByDoctorIdController,
};
