import { Request, Response } from "express";
import {
  scheduleService,
  handleGetSchedule,
  countTotalSchedulePage,
} from "src/services/scheduleServices";
import { length } from "zod";

const createScheduleController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || "";
    const schedule = await scheduleService(req.body);
    // if (!schedule) {
    //   res.status(400).json({
    //     success: false,
    //     message: "Tạo lịch khám thất bại.",
    //   });
    //   return;
    // }
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

const getScheduleByDoctorIdController = async (req: Request, res: Response) => {
  try {
    const { page, pageSize } = req.query;
    let currentPage = page ? +page : 1;
    if (currentPage <= 0) {
      currentPage = 1;
    }
    const totalPages = await countTotalSchedulePage(
      parseInt(pageSize as string)
    );

    const schedules = await handleGetSchedule(
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

export { createScheduleController, getScheduleByDoctorIdController };
