import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import { connectRabbitMQ } from "./queue/connection";
import { initializeAllRabbitMQConsumers } from "./queue/consumers";
import { startCleanupRefreshTokensJob } from "./jobs/cleanupRefreshTokens.job";
import initDatabase from "./config/seed";

const app = express();
const port = process.env.PORT || 8086;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

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
    console.log("✅ All RabbitMQ consumers initialized successfully.");

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
