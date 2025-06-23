import { Request, Response } from "express";
// import { createDoctorProfile } from "src/services/doctorServices";

const createDoctorController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || "";
    // const admin = await createDoctorProfile(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Tạo thông tin ADMIN thành công.",
      // data: admin,
    });
  } catch (error: any) {
    console.error("Error creating admin:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {createDoctorController} ;
