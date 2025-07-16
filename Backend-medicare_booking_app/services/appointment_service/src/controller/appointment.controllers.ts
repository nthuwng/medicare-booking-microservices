import { Request, Response } from "express";
import {
  createAppointmentService,
  getAppointmentsByUserService,
  getAppointmentByIdService,
  updateAppointmentStatusService,
} from "src/services/appointment.services";
import { AppointmentStatus } from "@shared/index";

const createAppointmentController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || "";
    const appointment = await createAppointmentService(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Tạo cuộc hẹn thành công.",
      data: appointment,
    });
  } catch (error: any) {
    console.error("Error creating appointment:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAppointmentsByUserController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || "";
    const appointments = await getAppointmentsByUserService(userId);
    res.status(200).json({
      success: true,
      message: "Lấy danh sách cuộc hẹn thành công.",
      data: appointments,
    });
  } catch (error: any) {
    console.error("Error getting appointments:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAppointmentByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await getAppointmentByIdService(id);
    res.status(200).json({
      success: true,
      message: "Lấy thông tin cuộc hẹn thành công.",
      data: appointment,
    });
  } catch (error: any) {
    console.error("Error getting appointment:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateAppointmentStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!Object.values(AppointmentStatus).includes(status)) {
      res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
      return;
    }

    const appointment = await updateAppointmentStatusService(id, status);
    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái cuộc hẹn thành công.",
      data: appointment,
    });
  } catch (error: any) {
    console.error("Error updating appointment status:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export {
  createAppointmentController,
  getAppointmentsByUserController,
  getAppointmentByIdController,
  updateAppointmentStatusController,
};
