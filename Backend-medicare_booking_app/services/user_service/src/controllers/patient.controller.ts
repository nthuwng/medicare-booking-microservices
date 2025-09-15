import { Request, Response } from "express";
import {
  createPatientProfile,
  getPatientByIdService,
  getAllPatientService,
  deletePatientService,
  countTotalPatientPage,
  getPatientByUserId,
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
    const { page, pageSize, fullName, phone } = req.query;
    let currentPage = page ? +page : 1;
    if (currentPage <= 0) {
      currentPage = 1;
    }
    const totalPages = await countTotalPatientPage(
      parseInt(pageSize as string)
    );

    const { patients, totalPatients } = await getAllPatientService(
      currentPage,
      parseInt(pageSize as string),
      fullName as string,
      phone as string
    );
    if (patients.length === 0) {
      res.status(200).json({
        success: true,
        message: "Không có thông tin patient nào trong trang này",
        data: {
          meta: {
            currentPage: currentPage,
            pageSize: parseInt(pageSize as string),
            pages: totalPages,
            total: totalPatients,
          },
          result: [],
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      length: totalPatients,
      message: "Lấy danh sách tất cả thông tin patient thành công.",
      data: {
        meta: {
          currentPage: currentPage,
          pageSize: parseInt(pageSize as string),
          pages: totalPages,
          total: totalPatients,
        },
        result: patients,
      },
    });
  } catch (error: any) {
    console.error("Error getting all patients:", error.message);
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

const getPatientByUserIdController = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const patient = await getPatientByUserId(userId);
  if (!patient) {
    res.status(404).json({ success: false, message: "Patient not found" });
    return;
  }
  res.status(200).json({
    success: true,
    message: "Lấy thông tin patient theo userId thành công.",
    data: patient,
  });
};

export {
  createPatientController,
  getPatientByIdController,
  getAllPatientController,
  deletePatientController,
  getPatientByUserIdController,
};
