import { Request, Response } from "express";
import {
  handleCreateClinicProfile,
  handleGetAllClinics,
  handleDeleteClinic,
  countTotalClinicsPage,
  handleUpdateClinic,
  countClinics,
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
    const { page, pageSize, city, clinicName } = req.query;
    let currentPage = page ? +page : 1;
    if (currentPage <= 0) {
      currentPage = 1;
    }
    const totalPages = await countTotalClinicsPage(
      parseInt(pageSize as string),
      city as string,
      clinicName as string
    );
    const totalItems = await countClinics(city as string, clinicName as string);
    const clinics = await handleGetAllClinics(
      currentPage,
      parseInt(pageSize as string),
      city as string,
      clinicName as string
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
            total: totalItems,
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
          total: totalItems,
        },
        result: clinics,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách phòng khám:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteClinicController = async (req: Request, res: Response) => {
  try {
    const clinicId = req.params.id;
    // Call the service function to delete the clinic
    const isDeleted = await handleDeleteClinic(clinicId);
    if (!isDeleted) {
      res.status(404).json({
        success: false,
        message: "Phòng khám không tồn tại hoặc đã được xóa trước đó.",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Xóa phòng khám thành công.",
    });
  } catch (error: any) {
    console.error("Lỗi khi xóa phòng khám:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateClinicController = async (req: Request, res: Response) => {
  try {
    const clinicId = req.params.id;
    const updateData = req.body;
    // Call the service function to update the clinic
    const updatedClinic = await handleUpdateClinic(clinicId, updateData);
    if (!updatedClinic) {
      res.status(404).json({
        success: false,
        message: "Phòng khám không tồn tại.",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin phòng khám thành công.",
      data: updatedClinic,
    });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật phòng khám:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
export {
  createClinicController,
  getClinicsController,
  deleteClinicController,
  updateClinicController,
};
