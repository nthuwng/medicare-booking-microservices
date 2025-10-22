import express from "express";
import "dotenv/config";
import ratingRoutes from "./routes/rating.routes";
import { connectRabbitMQ } from "./queue/connection";
import { initializeAllRabbitMQConsumers } from "./queue/consumers";
import cors from "cors";
const app = express();
const port = process.env.PORT || 8087;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost"],
    credentials: true,
  })
);

//config Routes
ratingRoutes(app);
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
      console.log(`✅ Rating_service listening on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1); // Thoát ứng dụng nếu có lỗi khởi động quan trọng
  }
};

startApplication(); // Gọi hàm khởi động chính
