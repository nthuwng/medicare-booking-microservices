import express from "express";
import "dotenv/config";
import adminRoutes from "./routes/admin.routes";
import { connectRabbitMQ } from "./queue/connection";
import patientRoutes from "./routes/patient.routes";
import { initializeAllRabbitMQConsumers } from "./queue/consumers";
import cors from "cors";
const app = express();
const port = process.env.PORT || 8081;

// Middleware
app.use(express.json());
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
// Routes
adminRoutes(app);
patientRoutes(app);

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
      console.log(`✅ User_service listening on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1); // Thoát ứng dụng nếu có lỗi khởi động quan trọng
  }
};

startApplication(); // Gọi hàm khởi động chính
