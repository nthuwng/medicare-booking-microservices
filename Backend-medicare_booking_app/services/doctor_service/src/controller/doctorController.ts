import { Request, Response } from "express";
import {
  createDoctorProfile,
  getDoctorByIdService,
  updateDoctorStatusService,
  addDoctorSpecialtyService,
  removeDoctorSpecialtyService,
  addDoctorClinicService,
  removeDoctorClinicService,
  getDoctorsBySpecialtyService,
  getDoctorsByClinicService,
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
      message: "Lấy thông tin DOCTOR thành công.",
      data: doctor,
    });
  } catch (error: any) {
    console.error("Error getting doctor by id:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDoctorStatusController = async (req: Request, res: Response) => {
  try {
    const doctor = await updateDoctorStatusService(req.params.id, req.body);
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

// New controllers for managing doctor-specialty relationships
const addDoctorSpecialtyController = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { specialtyId } = req.body;

    const result = await addDoctorSpecialtyService({
      doctorId,
      specialtyId: parseInt(specialtyId),
    });

    res.status(200).json({
      success: true,
      message: "Thêm chuyên khoa cho bác sĩ thành công.",
      data: result,
    });
  } catch (error: any) {
    console.error("Error adding doctor specialty:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeDoctorSpecialtyController = async (req: Request, res: Response) => {
  try {
    const { doctorId, specialtyId } = req.params;

    await removeDoctorSpecialtyService({
      doctorId,
      specialtyId: parseInt(specialtyId),
    });

    res.status(200).json({
      success: true,
      message: "Xóa chuyên khoa của bác sĩ thành công.",
    });
  } catch (error: any) {
    console.error("Error removing doctor specialty:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// New controllers for managing doctor-clinic relationships
const addDoctorClinicController = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { clinicId } = req.body;

    const result = await addDoctorClinicService({
      doctorId,
      clinicId: parseInt(clinicId),
    });

    res.status(200).json({
      success: true,
      message: "Thêm phòng khám cho bác sĩ thành công.",
      data: result,
    });
  } catch (error: any) {
    console.error("Error adding doctor clinic:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeDoctorClinicController = async (req: Request, res: Response) => {
  try {
    const { doctorId, clinicId } = req.params;

    await removeDoctorClinicService({
      doctorId,
      clinicId: parseInt(clinicId),
    });

    res.status(200).json({
      success: true,
      message: "Xóa phòng khám của bác sĩ thành công.",
    });
  } catch (error: any) {
    console.error("Error removing doctor clinic:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controllers for getting doctors by specialty or clinic
const getDoctorsBySpecialtyController = async (req: Request, res: Response) => {
  try {
    const { specialtyId } = req.params;
    const doctors = await getDoctorsBySpecialtyService(parseInt(specialtyId));

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bác sĩ theo chuyên khoa thành công.",
      data: doctors,
    });
  } catch (error: any) {
    console.error("Error getting doctors by specialty:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorsByClinicController = async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.params;
    const doctors = await getDoctorsByClinicService(parseInt(clinicId));

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bác sĩ theo phòng khám thành công.",
      data: doctors,
    });
  } catch (error: any) {
    console.error("Error getting doctors by clinic:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createDoctorController,
  getDoctorByIdController,
  updateDoctorStatusController,
  addDoctorSpecialtyController,
  removeDoctorSpecialtyController,
  addDoctorClinicController,
  removeDoctorClinicController,
  getDoctorsBySpecialtyController,
  getDoctorsByClinicController,
};
