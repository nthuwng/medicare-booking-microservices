import { Request, Response } from "express";
import { uploadToCloudinary } from "src/services/upload.services";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if ((req as any).fileValidationError) {
      res.status(200).json({
        success: false,
        error: "INVALID_IMAGE_TYPE",
        message: "Chỉ cho phép ảnh JPEG hoặc PNG",
      });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const result = await uploadToCloudinary(req.file.path);
    res.status(200).json({
      success: true,
      message: "Upload image successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
