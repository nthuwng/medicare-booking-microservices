import { Request, Response } from "express";
import { handleCreateClinicProfile } from "src/services/clinicServices";

const createClinicController = async (req: Request, res: Response) => {
  try {
    const clinic = await handleCreateClinicProfile(req.body);
    if (!clinic) {
      res.status(400).json({
        success: false,
        message: "Tạo thông tin phòng khám thất bại.",
      });
      return;
    }
    res.status(201).json({
      success: true,
      message: "Tạo thông tin phòng khám thành công.",
      data: clinic,
    });
  } catch (error: any) {
    console.error("Lỗi khi tạo phòng khám:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createClinicController };
