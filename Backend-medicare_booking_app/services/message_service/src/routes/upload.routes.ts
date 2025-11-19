import express, { Express } from "express";
import { uploadImage } from "src/controllers/upload.controllers";
import fileUploadMiddleware from "src/middlewares/multer";

const router = express.Router();

const uploadRoutes = (app: Express) => {
  // API tạo hoặc lấy conversation giữa doctor và patient
  router.post("/image", fileUploadMiddleware("image"), uploadImage);

  app.use("/upload", router);
};

export default uploadRoutes;
