import { Request, Response } from "express";
import {
  createPatientProfile,
  getPatientByIdService,
  getAllPatientService,
  deletePatientService
} from "../services/patient.service";

const createPatientController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || "";
    const patient = await createPatientProfile(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Tạo thông tin bệnh nhân thành công.",
      data: patient,
    });
  } catch (error: any) {
    console.error("Error creating patient:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatientByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const patient = await getPatientByIdService(id);
    res.status(201).json({
      success: true,
      message: "Lấy thông tin patient thành công.",
      data: patient,
    });
  } catch (error: any) {
    console.error("Error creating patient:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPatientController = async (req: Request, res: Response) => {
  try {
    const patients = await getAllPatientService();
    res.status(201).json({
      success: true,
      count: patients.length,
      message: "Lấy tất cả thông tin patient thành công.",
      data: patients,
    });
  } catch (error: any) {
    console.error("Error creating patient:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePatientController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await deletePatientService(id);
    res.status(201).json({
      success: true,
      message: "Xóa thông tin patient thành công.",
    });
  } catch (error: any) {
    console.error("Error deleting patient:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createPatientController,
  getPatientByIdController,
  getAllPatientController,
  deletePatientController
};
