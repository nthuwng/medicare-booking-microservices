import { Request, Response } from "express";
import { getDoctorIdByUserIdViaRabbitMQ } from "src/queue/publishers/schedule.publisher";
import { getScheduleByScheduleId } from "src/repository/schedule.repo";
import {
  countTotalSchedulePage,
  handleGetAllSchedule,
  scheduleService,
  getScheduleByDoctorId,
  getScheduleById,
  updateExpiredTimeSlots,
  deleteScheduleByTimeSlotId,
  deleteScheduleByScheduleId,
} from "src/services/scheduleServices";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(tz);
const APP_TZ = "Asia/Ho_Chi_Minh";

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
    const { userId } = req.params;
    const { date, from, to } = req.query as {
      date?: string;
      from?: string;
      to?: string;
    };

    // Validate định dạng YYYY-MM-DD (rất chặt để tránh sai TZ)
    const isYMD = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

    if (date && !isYMD(date)) {
      res
        .status(400)
        .json({ success: false, message: "date phải dạng YYYY-MM-DD" });
    }
    if ((from && !isYMD(from)) || (to && !isYMD(to))) {
      res
        .status(400)
        .json({ success: false, message: "from/to phải dạng YYYY-MM-DD" });
    }
    if (from && to && dayjs(from).isAfter(dayjs(to))) {
      res
        .status(400)
        .json({ success: false, message: "from không được lớn hơn to" });
    }

    const doctorId = await getDoctorIdByUserIdViaRabbitMQ(userId as string);

    // Xây điều kiện thời gian
    let range:
      | { mode: "exact"; start: Date; end: Date }
      | { mode: "range"; start: Date; end: Date }
      | { mode: "fromToday"; start: Date };

    if (date) {
      const start = dayjs.tz(`${date} 00:00:00`, APP_TZ).utc().toDate();
      const end = dayjs.tz(`${date} 23:59:59.999`, APP_TZ).utc().toDate();
      range = { mode: "exact", start, end };
    } else if (from || to) {
      const start = dayjs
        .tz(`${from ?? to} 00:00:00`, APP_TZ)
        .utc()
        .toDate();
      const end = dayjs
        .tz(`${to ?? from} 23:59:59.999`, APP_TZ)
        .utc()
        .toDate();
      range = { mode: "range", start, end };
    } else {
      const start = dayjs
        .tz(dayjs().format("YYYY-MM-DD") + " 00:00:00", APP_TZ)
        .utc()
        .toDate();
      range = { mode: "fromToday", start };
    }

    const schedule = await getScheduleByDoctorId(doctorId, range);

    if (!schedule.length) {
      res.status(200).json({
        success: true,
        length: 0,
        message: "Không tìm thấy lịch theo điều kiện.",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      length: schedule.length,
      message: "Lấy lịch khám của bác sĩ thành công.",
      data: schedule,
    });
  } catch (error: any) {
    console.error("Error getting schedule by doctorId:", error.message);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
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
      length: schedule.data.schedule.length,
      message: "Lấy lịch khám thành công.",
      data: schedule,
    });
  } catch (error: any) {
    console.error("Error getting schedule by id:", error.message);
  }
};

const updateExpiredTimeSlotsController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await updateExpiredTimeSlots();
    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    console.error("Error updating expired time slots:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật time slots hết hạn",
      error: error.message,
    });
  }
};

const getScheduleByScheduleIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await getScheduleByScheduleId(scheduleId);

    res.status(200).json({
      success: true,
      message: "Lấy lịch khám thành công.",
      data: schedule,
    });
  } catch (error: any) {
    console.error("Error getting schedule by scheduleId:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteScheduleByScheduleIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { scheduleId } = req.params;
    const result = await deleteScheduleByScheduleId(scheduleId);

    res.status(200).json({
      success: true,
      message: result.message || "Xóa lịch khám thành công.",
      data: result,
    });
  } catch (error: any) {
    console.error("Error deleting schedule by scheduleId:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi xóa lịch khám",
    });
  }
};

const deleteScheduleByTimeSlotIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { timeSlotId, scheduleId } = req.params;
    const result = await deleteScheduleByTimeSlotId(timeSlotId, scheduleId);
    if (!result) {
      res.status(400).json({
        success: false,
        message: "Không thể xóa lịch khám vì đã có đặt khám.",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: result.message || "Xóa lịch khám thành công.",
    });
  } catch (error: any) {
    console.error("Error deleting schedule by timeSlotId:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi xóa lịch khám",
    });
  }
};

export {
  createScheduleController,
  getAllScheduleController,
  getScheduleByDoctorIdController,
  getScheduleByIdController,
  updateExpiredTimeSlotsController,
  getScheduleByScheduleIdController,
  deleteScheduleByScheduleIdController,
  deleteScheduleByTimeSlotIdController,
};
