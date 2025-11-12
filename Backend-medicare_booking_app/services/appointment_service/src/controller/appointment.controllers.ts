import { Request, Response } from "express";
import {
  createAppointmentService,
  getAppointmentsByUserService,
  getAppointmentByIdService,
  updateAppointmentStatusService,
  handleAppointmentsByDoctorIdServices,
  countTotalAppointmentPage,
  handleCancelAppointment,
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
    const { page, pageSize, status } = req.query;

    // Validate and set page number
    let currentPage = page ? +page : 1;
    if (currentPage <= 0) {
      currentPage = 1;
    }

    // Validate and set page size (min: 1, max: 100, default: 10)
    const size = Math.max(1, Math.min(100, Number(pageSize) || 10));

    const userId = req.user?.userId || "";

    // Get appointments with pagination
    const result = await getAppointmentsByUserService(
      userId,
      currentPage,
      size,
      status as string | undefined
    );

    res.status(200).json({
      success: true,
      length: result.pagination.totalItems,
      message: "Lấy danh sách cuộc hẹn thành công.",
      data: {
        meta: {
          currentPage: result.pagination.currentPage,
          pageSize: result.pagination.pageSize,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems,
        },
        result: result.appointments,
      },
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
      message: "Lấy danh sách tất cả cuộc hẹn bác sĩ thành công.",
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

const cancelAppointmentController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await handleCancelAppointment(id);

    // Xác định message dựa trên payment gateway
    let message = "Đã hủy lịch hẹn thành công.";

    if (result.payment.gateway === "VNPAY") {
      if (result.payment.refundProcessed) {
        message =
          "Đã hủy lịch hẹn và hoàn tiền thành công. Tiền sẽ về tài khoản trong 3-5 ngày làm việc.";
      } else if (result.payment.refundRequired) {
        message =
          "Đã hủy lịch hẹn và đang xử lý hoàn tiền. Vui lòng kiểm tra lại sau.";
      } else {
        message = "Đã hủy lịch hẹn thành công.";
      }
    } else if (result.payment.gateway === "CASH") {
      message = "Đã hủy lịch hẹn thành công.";
    }

    res.status(200).json({
      success: true,
      message: message,
      data: result,
    });
  } catch (error: any) {
    console.error("Error cancelling appointment:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export {
  createAppointmentController,
  getAppointmentsByUserController,
  getAppointmentByIdController,
  updateAppointmentStatusController,
  getAllAppointmentsByDoctorIdController,
  cancelAppointmentController,
};
