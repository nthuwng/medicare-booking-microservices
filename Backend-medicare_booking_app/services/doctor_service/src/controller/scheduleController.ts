import { Request, Response } from "express";
import { getScheduleByDoctorId } from "src/repository/schedule.repo";
import scheduleService from "src/services/scheduleServices";

const createScheduleController = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Validation cơ bản
    if (
      !body.doctorId ||
      !body.date ||
      !body.startTime ||
      !body.endTime ||
      !body.clinicId
    ) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: doctorId, date, startTime, endTime, clinicId",
      });
      return;
    }

    const schedule = await scheduleService(body);

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
    const { doctorId } = req.params;
    const schedule = await getScheduleByDoctorId(doctorId);
    res.status(200).json({
      success: true,
      message: "Lấy lịch khám thành công.",
      data: schedule,
    });
  } catch (error: any) {
    console.error("Error getting schedule by doctorId:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { createScheduleController,getScheduleByDoctorIdController };
