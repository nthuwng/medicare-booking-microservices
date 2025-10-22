import express from "express";
import "dotenv/config";
import { connectRabbitMQ } from "./queue/connection";
import { initializeAllRabbitMQConsumers } from "./queue/consumers";
import routers from "./routes/index.routes";
import initDatabase from "./config/seed";
import cors from "cors";
const app = express();
const port = process.env.PORT || 8083;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost"],
    credentials: true,
  })
);

//config Routes
routers(app);
// Start server
const startApplication = async () => {
  try {
    //Kết nối Message Broker (RabbitMQ)
    await connectRabbitMQ();
    console.log("✅ Connected to RabbitMQ");

    //Khởi tạo tất cả Consumers
    await initializeAllRabbitMQConsumers();

    //Khởi động HTTP Server (hoặc gRPC server)
    await initDatabase();
    app.listen(port, () => {
      console.log(`✅ Doctor_service listening on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1); // Thoát ứng dụng nếu có lỗi khởi động quan trọng
  }
};

startApplication(); // Gọi hàm khởi động chính
