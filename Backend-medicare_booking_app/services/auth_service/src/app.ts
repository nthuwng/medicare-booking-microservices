import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import { connectRabbitMQ } from "./queue/connection";
import { initializeAllRabbitMQConsumers } from "./queue/consumers";
import { startCleanupRefreshTokensJob } from "./jobs/cleanupRefreshTokens.job";
import initDatabase from "./config/seed";
import cors from "cors";
import { redis } from "./config/redis";
const app = express();
const port = process.env.PORT || 8086;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost",
      "https://medicare-booking-app.cloud",
      "http://medicare-booking-app.cloud",
      "https://medicare-nginx.onrender.com"
    ],
    credentials: true,
  })
);

// Register routes
authRoutes(app);

// Start server
const startApplication = async () => {
  try {
    //Kết nối Message Broker (RabbitMQ)
    await connectRabbitMQ();
    console.log("✅ Connected to RabbitMQ");

    //Khởi tạo tất cả Consumers
    await initializeAllRabbitMQConsumers();

    //Khởi động HTTP Server (hoặc gRPC server)
    app.listen(port, () => {
      console.log(`✅ Auth_service listening on port ${port}`);
    });

    startCleanupRefreshTokensJob();
    initDatabase();
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1); // Thoát ứng dụng nếu có lỗi khởi động quan trọng
  }
};

startApplication(); // Gọi hàm khởi động chính
