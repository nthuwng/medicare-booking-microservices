import express from "express";
import { uploadImage } from "src/controllers/upload.controllers";
import fileUploadMiddleware from "src/middleware/multer";

const router = express.Router();

router.post("/image", fileUploadMiddleware("image"), uploadImage);

export default router;