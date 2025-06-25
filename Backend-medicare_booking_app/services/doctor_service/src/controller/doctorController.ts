import { Request, Response } from "express";
import {
  createDoctorProfile,
  getDoctorByIdService,
  updateDoctorStatusService,
} from "src/services/doctorServices";

const createDoctorController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || "";
    const doctor = await createDoctorProfile(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Tạo thông tin DOCTOR thành công.",
      data: doctor,
    });
  } catch (error: any) {
    console.error("Error creating doctor:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorByIdController = async (req: Request, res: Response) => {
  try {
    const doctor = await getDoctorByIdService(req.params.id);
    res.status(200).json({
      success: true,
      message: "Lấy thông tin DOCTOR thành công.",
      data: doctor,
    });
  } catch (error: any) {
    console.error("Error getting doctor by id:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDoctorStatusController = async (req: Request, res: Response) => {
  try {
    const doctor = await updateDoctorStatusService(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái DOCTOR thành công.",
      data: doctor,
    });
  } catch (error: any) {
    console.error("Error updating doctor status:", error.message);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi cập nhật trạng thái DOCTOR.",
      error: error.message,
    });
  }
};

export {
  createDoctorController,
  getDoctorByIdController,
  updateDoctorStatusController,
};
