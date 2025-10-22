import cors from "cors";
import express from "express";
import "dotenv/config";
import http from "http";
import { connectRabbitMQ } from "./queue/connection";
import notificationRoutes from "./routes/notification.routes";
import { initializeAllRabbitMQConsumers } from "./queue/consumers";
import { initSocketIO } from "./socket";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8084;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//config Routes
notificationRoutes(app);

// Start server
const startApplication = async () => {
  try {
    //Khởi tạo Socket.IO
    initSocketIO(server);

    //Kết nối Message Broker (RabbitMQ)
    await connectRabbitMQ();
    console.log("✅ Connected to RabbitMQ");

    //Khởi tạo tất cả Consumers
    await initializeAllRabbitMQConsumers();

    //Khởi động HTTP Server (hoặc gRPC server)
    server.listen(port, () => {
      console.log(`✅ User_service listening on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1); // Thoát ứng dụng nếu có lỗi khởi động quan trọng
  }
};

startApplication(); // Gọi hàm khởi động chính
