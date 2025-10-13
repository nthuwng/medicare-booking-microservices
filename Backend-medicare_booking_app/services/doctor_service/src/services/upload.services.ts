import cloudinary from "../config/cloudinary";
import fs from "fs";

export const uploadToCloudinary = async (
  filePath: string,
  folder = "medicare"
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder });

    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    fs.unlinkSync(filePath);
    throw error;
  }
};

export const uploadToCloudinaryByUrl = async (
  url: string,
  folder = "medicare"
) => {
  const result = await cloudinary.uploader.upload(url, { folder });
  return result;
};
