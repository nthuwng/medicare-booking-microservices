import express from "express";
import "dotenv/config";
import initDatabase from "./config/seed";
import scheduleRoutes from "./routes/schedule";
import timeSlotRoutes from "./routes/timeSlotRoutes";
import { connectRabbitMQ } from "./queue/connection";
import { initializeAllRabbitMQConsumers } from "./queue/consumers";
import { updateExpiredSlotsJob } from "./jobs/updateExpiredSlots.job";
import cors from "cors";
const app = express();
const port = process.env.PORT || 8088;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost"],
    credentials: true,
  })
);

//config Routes
scheduleRoutes(app);
timeSlotRoutes(app);

// Start server
const startApplication = async () => {
  try {
    //Kết nối Message Broker (RabbitMQ)
    await connectRabbitMQ();
    console.log("✅ Connected to RabbitMQ");

    //Khởi tạo tất cả Consumers
    await initializeAllRabbitMQConsumers();

    //Khởi tạo job cập nhật time slots hết hạn
    updateExpiredSlotsJob();

    //Khởi động HTTP Server (hoặc gRPC server)
    app.listen(port, () => {
      console.log(`✅ Schedule_service listening on port ${port}`);
    });

    initDatabase();
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1); // Thoát ứng dụng nếu có lỗi khởi động quan trọng
  }
};

startApplication(); // Gọi hàm khởi động chính
