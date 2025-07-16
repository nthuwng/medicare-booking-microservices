import { Request, Response } from "express";
import {
  countTotalSchedulePage,
  handleGetAllSchedule,
  scheduleService,
  getScheduleByDoctorId,
  getScheduleById,
} from "src/services/scheduleServices";
import { length } from "zod";

const createScheduleController = async (req: Request, res: Response) => {
  try {
    const schedule = await scheduleService(req.body);
    if (!schedule) {
      res.status(400).json({
        success: false,
        message: "Tạo lịch khám thất bại.",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Tạo lịch khám thành công.",
      data: schedule,
    });
  } catch (error: any) {
    console.error("Error creating schedule:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllScheduleController = async (req: Request, res: Response) => {
  try {
    const { page, pageSize } = req.query;
    let currentPage = page ? +page : 1;
    if (currentPage <= 0) {
      currentPage = 1;
    }
    const totalPages = await countTotalSchedulePage(
      parseInt(pageSize as string)
    );

    const schedules = await handleGetAllSchedule(
      currentPage,
      parseInt(pageSize as string)
    );

    if (schedules.schedules.length === 0) {
      res.status(200).json({
        success: true,
        message: "Không có lịch khám nào trong trang này",
        data: {
          meta: {
            currentPage: currentPage,
            pageSize: parseInt(pageSize as string),
            pages: totalPages,
            total: schedules.totalSchedules,
          },
          result: {
            length: 0,
            data: [],
          },
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Lấy lịch khám thành công.",
      data: {
        meta: {
          currentPage: currentPage,
          pageSize: parseInt(pageSize as string),
          pages: totalPages,
          total: schedules.totalSchedules,
        },
        result: {
          length: schedules.schedules.length,
          data: schedules.schedules,
        },
      },
    });
  } catch (error: any) {
    console.error("Error getting schedule by doctorId:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getScheduleByDoctorIdController = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const schedule = await getScheduleByDoctorId(doctorId);
    if (schedule.length === 0) {
      res.status(200).json({
        success: true,
        length: 0,
        message: "Bác sĩ này chưa có lịch khám",
        data: [],
      });
      return;
    }
    res.status(200).json({
      success: true,
      length: schedule.length,
      message: "Lấy lịch khám của bác sĩ thành công.",
      data: schedule,
    });
  } catch (error: any) {
    console.error("Error getting schedule by doctorId:", error.message);
  }
};

const getScheduleByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const schedule = await getScheduleById(id);
    if (!schedule || schedule.data.schedule === null) {
      res.status(200).json({
        success: true,
        message: "Lịch khám không tồn tại",
        data: [],
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Lấy lịch khám thành công.",
      data: schedule,
    });
  } catch (error: any) {
    console.error("Error getting schedule by id:", error.message);
  }
};

export {
  createScheduleController,
  getAllScheduleController,
  getScheduleByDoctorIdController,
  getScheduleByIdController
};
