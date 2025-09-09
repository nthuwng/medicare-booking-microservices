import { Request, Response } from "express";
import {
  createAppointmentService,
  getAppointmentsByUserService,
  getAppointmentByIdService,
  updateAppointmentStatusService,
  handleAppointmentsByDoctorIdServices,
  countTotalAppointmentPage,
} from "src/services/appointment.services";
import { AppointmentStatus } from "@shared/index";
import { getDoctorIdByUserIdViaRabbitMQ } from "src/queue/publishers/appointment.publisher";

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

const getAllAppointmentsByDoctorIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;

    const { page, pageSize } = req.query;
    let currentPage = page ? +page : 1;
    if (currentPage <= 0) {
      currentPage = 1;
    }
    const totalPages = await countTotalAppointmentPage(
      parseInt(pageSize as string)
    );

    const doctorId = await getDoctorIdByUserIdViaRabbitMQ(userId as string);
    const { appointments, totalAppointments } =
      await handleAppointmentsByDoctorIdServices(
        doctorId,
        currentPage,
        parseInt(pageSize as string)
      );

    if (appointments.length === 0) {
      res.status(200).json({
        success: true,
        message: "Không có bác sĩ nào được duyệt trong trang này",
        data: {
          meta: {
            currentPage: currentPage,
            pageSize: parseInt(pageSize as string),
            pages: totalPages,
            total: totalAppointments,
          },
          result: [],
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      length: appointments.length,
      message: "Lấy danh sách tất cả bác sĩ thành công.",
      data: {
        meta: {
          currentPage: currentPage,
          pageSize: parseInt(pageSize as string),
          pages: totalPages,
          total: totalAppointments,
        },
        result: appointments,
      },
    });
  } catch (error: any) {
    console.error("Error getting appointments:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export {
  createAppointmentController,
  getAppointmentsByUserController,
  getAppointmentByIdController,
  updateAppointmentStatusController,
  getAllAppointmentsByDoctorIdController,
};
