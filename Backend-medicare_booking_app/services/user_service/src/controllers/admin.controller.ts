import { Request, Response } from "express";
import {
  createAdminProfile,
  getAdminByIdService,
  getAllAdminService,
  deleteAdminService,
  countTotalAdminPage,
} from "../services/admin.service";

const createAdminController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || "";
    const admin = await createAdminProfile(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Tạo thông tin ADMIN thành công.",
      data: admin,
    });
  } catch (error: any) {
    console.error("Error creating admin:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const admin = await getAdminByIdService(id);
    res.status(201).json({
      success: true,
      message: "Lấy thông tin admin thành công.",
      data: admin,
    });
  } catch (error: any) {
    console.error("Error creating admin:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllAdmintController = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, fullName, phone } = req.query;
    let currentPage = page ? +page : 1;
    if (currentPage <= 0) {
      currentPage = 1;
    }
    const totalPages = await countTotalAdminPage(parseInt(pageSize as string));

    const { admins, totalAdmins } = await getAllAdminService(
      currentPage,
      parseInt(pageSize as string),
      fullName as string,
      phone as string
    );
    if (admins.length === 0) {
      res.status(200).json({
        success: true,
        message: "Không có thông tin admin nào trong trang này",
        data: {
          meta: {
            currentPage: currentPage,
            pageSize: parseInt(pageSize as string),
            pages: totalPages,
            total: admins.length,
          },
          result: [],
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      length: admins.length,
      message: "Lấy danh sách tất cả thông tin admin thành công.",
      data: {
        meta: {
          currentPage: currentPage,
          pageSize: parseInt(pageSize as string),
          pages: totalPages,
          total: admins.length,
        },
        result: admins,
      },
    });
  } catch (error: any) {
    console.error("Error getting all admins:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAdminController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await deleteAdminService(id);
    res.status(201).json({
      success: true,
      message: "Xóa thông tin admin thành công.",
    });
  } catch (error: any) {
    console.error("Error deleting admin:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createAdminController,
  getAdminByIdController,
  getAllAdmintController,
  deleteAdminController,
};
