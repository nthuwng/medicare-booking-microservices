import { Request, Response } from "express";
import {
  createDoctorProfile,
  getDoctorByIdService,
  updateDoctorStatusService,
  handleGetAllDoctors,
  countTotalDoctorPage,
  handleGetAllApprovedDoctors,
  getDoctorByUserIdService
} from "src/services/doctorServices";

const createDoctorController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || "";
    const doctor = await createDoctorProfile(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Tạo thông tin DOCTOR thành công.",
      data: doctor,
    });
  } catch (error: any) {
    console.error("Error creating doctor:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorByIdController = async (req: Request, res: Response) => {
  try {
    const doctor = await getDoctorByIdService(req.params.id);
    res.status(200).json({
      success: true,
      message: "Lấy thông tin DOCTOR theo id thành công.",
      data: doctor,
    });
  } catch (error: any) {
    console.error("Error getting doctor by id:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDoctorStatusController = async (req: Request, res: Response) => {
  try {
    const doctor = await updateDoctorStatusService(req.params.id);
    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái DOCTOR thành công.",
      data: doctor,
    });
  } catch (error: any) {
    console.error("Error updating doctor status:", error.message);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi cập nhật trạng thái DOCTOR.",
      error: error.message,
    });
  }
};

const getAllDoctorsController = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, fullName, phone , title } = req.query;
    let currentPage = page ? +page : 1;
    if (currentPage <= 0) {
      currentPage = 1;
    }
    const totalPages = await countTotalDoctorPage(parseInt(pageSize as string));
    const { doctors, totalDoctors } = await handleGetAllDoctors(
      currentPage,
      parseInt(pageSize as string),
      fullName as string,
      phone as string,
      title as string
    );

    if (doctors.length === 0) {
      res.status(200).json({
        success: true,
        message: "Không có bác sĩ nào được duyệt trong trang này",
        data: {
          meta: {
            currentPage: currentPage,
            pageSize: parseInt(pageSize as string),
            pages: totalPages,
            total: totalDoctors,
          },
          result: [],
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      length: doctors.length,
      message: "Lấy danh sách tất cả bác sĩ thành công.",
      data: {
        meta: {
          currentPage: currentPage,
          pageSize: parseInt(pageSize as string),
          pages: totalPages,
          total: totalDoctors,
        },
        result: doctors,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllApprovedDoctorsController = async (req: Request, res: Response) => {
  try {
    const { page, pageSize } = req.query;
    let currentPage = page ? +page : 1;
    if (currentPage <= 0) {
      currentPage = 1;
    }
    const totalPages = await countTotalDoctorPage(parseInt(pageSize as string));
    const { doctors, totalDoctors } = await handleGetAllApprovedDoctors(
      currentPage,
      parseInt(pageSize as string)
    );

    if (doctors.length === 0) {
      res.status(200).json({
        success: true,
        message: "Không có bác sĩ nào được duyệt trong trang này",
        data: {
          meta: {
            currentPage: currentPage,
            pageSize: parseInt(pageSize as string),
            pages: totalPages,
            total: totalDoctors,
          },
          result: [],
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      length: doctors.length,
      message: "Lấy danh sách tất cả bác sĩ đã được duyệt thành công.",
      data: {
        meta: {
          currentPage: currentPage,
          pageSize: parseInt(pageSize as string),
          pages: totalPages,
          total: totalDoctors,
        },
        result: doctors,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorByUserIdController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const doctor = await getDoctorByUserIdService(userId);
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: "Doctor không tồn tại",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Lấy thông tin DOCTOR theo userId thành công.",
      data: doctor,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createDoctorController,
  getDoctorByIdController,
  updateDoctorStatusController,
  getAllDoctorsController,
  getAllApprovedDoctorsController,
  getDoctorByUserIdController
};
