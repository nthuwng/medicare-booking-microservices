import { Request, Response } from "express";
import {
  handleCreateClinicProfile,
  handleGetAllClinics,
  countTotalClinicsPage,
} from "src/services/clinicServices";

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

const getClinicsController = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, city } = req.query;
    let currentPage = page ? +page : 1;
    if (currentPage <= 0) {
      currentPage = 1;
    }
    const totalPages = await countTotalClinicsPage(
      parseInt(pageSize as string)
    );
    const clinics = await handleGetAllClinics(
      currentPage,
      parseInt(pageSize as string),
      city as string
    );

    if (clinics.length === 0) {
      res.status(200).json({
        success: true,
        message: "Không có phòng khám nào trong trang này",
        data: {
          meta: {
            currentPage: currentPage,
            pageSize: parseInt(pageSize as string),
            pages: totalPages,
            total: clinics.length,
          },
          result: [],
        },
      });
      return;
    }
    res.status(200).json({
      success: true,
      length: clinics.length,
      message: "Lấy danh sách tất cả phòng khám thành công.",
      data: {
        meta: {
          currentPage: currentPage,
          pageSize: parseInt(pageSize as string),
          pages: totalPages,
          total: clinics.length,
        },
        result: clinics,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách phòng khám:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
export { createClinicController, getClinicsController };
