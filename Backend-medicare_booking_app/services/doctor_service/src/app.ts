import express from "express";
import "dotenv/config";
import doctorRoutes from "./routes/doctorRoutes";
import specialtiesRoutes from "./routes/specialtiesRoutes";
import { connectRabbitMQ } from "./queue/connection";
import clinicRoutes from "./routes/clinicRoutes";

const app = express();
const port = process.env.PORT || 8083;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//config Routes
doctorRoutes(app);
specialtiesRoutes(app);
clinicRoutes(app);

// Start server
const startApplication = async () => {
  try {
    //Kết nối Message Broker (RabbitMQ)
    await connectRabbitMQ();
    console.log("✅ Connected to RabbitMQ");

    //Khởi tạo tất cả Consumers
    // await initializeAllRabbitMQConsumers();
    // console.log("✅ All RabbitMQ consumers initialized successfully.");

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