import { Request, Response } from "express";
import {
  countTotalSpecialtiesPage,
  handleCreateSpecialtiesProfile,
  handleGetAllSpecialties,
} from "src/services/specialtiesServices";

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

const getSpecialtiesController = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, specialtyName } = req.query;
    let currentPage = page ? +page : 1;
    if (currentPage <= 0) {
      currentPage = 1;
    }
    const totalPages = await countTotalSpecialtiesPage(
      parseInt(pageSize as string)
    );
    const specialties = await handleGetAllSpecialties(
      currentPage,
      parseInt(pageSize as string),
      specialtyName as string
    );

    if (specialties.length === 0) {
      res.status(200).json({
        success: true,
        message: "Không có chuyên khoa nào trong trang này",
        data: {
          meta: {
            currentPage: currentPage,
            pageSize: parseInt(pageSize as string),
            pages: totalPages,
            total: specialties.length,
          },
          result: [],
        },
      });
      return;
    }
    res.status(200).json({
      success: true,
      length: specialties.length,
      message: "Lấy danh sách tất cả chuyên khoa thành công.",
      data: {
        meta: {
          currentPage: currentPage,
          pageSize: parseInt(pageSize as string),
          pages: totalPages,
          total: specialties.length,
        },
        result: specialties,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách chuyên khoa:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createSpecialtiesController, getSpecialtiesController };
