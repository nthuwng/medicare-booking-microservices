import { Request, Response } from "express";
import {
  countTotalSpecialtiesPage,
  handleCreateSpecialtiesProfile,
  handleGetAllSpecialties,
  handleDeleteSpecialty,
  handleUpdateSpecialty,
  countSpecialties,
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
      parseInt(pageSize as string),
      specialtyName as string
    );
    const totalItems = await countSpecialties(specialtyName as string);
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
            total: totalItems,
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
          total: totalItems,
        },
        result: specialties,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách chuyên khoa:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSpecialtyController = async (req: Request, res: Response) => {
  try {
    const specialtyId = req.params.id;
    // Call the service function to delete the specialty
    const isDeleted = await handleDeleteSpecialty(specialtyId);
    if (!isDeleted) {
      res.status(404).json({
        success: false,
        message: "Chuyên khoa không tồn tại hoặc đã được xóa trước đó.",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Xóa chuyên khoa với ID " + specialtyId + " thành công.",
    });
  } catch (error: any) {
    console.error("Lỗi khi xóa chuyên khoa:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSpecialtyController = async (req: Request, res: Response) => {
  try {
    const specialtyId = req.params.id;
    const updateData = req.body;
    // Call the service function to update the clinic
    const updatedClinic = await handleUpdateSpecialty(specialtyId, updateData);
    if (!updatedClinic) {
      res.status(404).json({
        success: false,
        message: "Chuyên khoa không tồn tại.",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin chuyên khoa thành công.",
      data: updatedClinic,
    });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật chuyên khoa:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createSpecialtiesController,
  getSpecialtiesController,
  deleteSpecialtyController,
  updateSpecialtyController,
};
