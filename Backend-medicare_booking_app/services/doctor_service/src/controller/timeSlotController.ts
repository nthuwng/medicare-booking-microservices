import { Request, Response } from "express";
import {
  handleCreateTimeSlot,
  handleGetAllTimeSlots,
} from "src/services/timeSlotServices";

const createTimeSlotController = async (req: Request, res: Response) => {
  try {
    const timeSlot = await handleCreateTimeSlot(req.body);

    if (!timeSlot) {
      res.status(400).json({
        success: false,
        message: "Tạo khung giờ khám thất bại.",
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Tạo khung giờ khám thành công.",
      data: timeSlot,
    });
  } catch (error: any) {
    console.error("Lỗi khi tạo lịch khám:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllTimeSlotsController = async (req: Request, res: Response) => {
  try {
    const timeSlots = await handleGetAllTimeSlots();
    if (!timeSlots) {
      res.status(400).json({
        success: false,
        message: "Không tìm thấy khung giờ khám.",
      });
      return;
    }
    res.status(200).json({
      success: true,
      length: timeSlots.length,
      message: "Lấy tất cả khung giờ khám thành công.",
      data: timeSlots,
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy tất cả khung giờ khám:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createTimeSlotController, getAllTimeSlotsController };
