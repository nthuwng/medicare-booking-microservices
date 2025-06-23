import { Request, Response } from "express";
import { handleCreateSpecialtiesProfile } from "src/services/specialtiesServices";

const createSpecialtiesController = async (req: Request, res: Response) => {
  try {
    const specialties = await handleCreateSpecialtiesProfile(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo thông tin chuyên khoa thành công.",
      data: specialties,
    });
  } catch (error: any) {
    console.error("Lỗi khi tạo chuyên khoa:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createSpecialtiesController };
