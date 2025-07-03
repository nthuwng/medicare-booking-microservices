import { Request, Response } from "express";
import {
  createAdminProfile,
  getAdminByIdService,
  getAllAdminService,
  deleteAdminService
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
    const admins = await getAllAdminService();
    res.status(201).json({
      success: true,
      count: admins.length,
      message: "Lấy tất cả thông tin patient thành công.",
      data: admins,
    });
  } catch (error: any) {
    console.error("Error creating patient:", error.message);
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
  deleteAdminController
};
