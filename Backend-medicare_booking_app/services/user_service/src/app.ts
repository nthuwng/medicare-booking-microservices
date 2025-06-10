import express from "express";
import "dotenv/config";
import testRoutes from "./routes/testRoutes";
import { seedData } from "./config/seed";

const app = express();
const port = process.env.PORT || 8081;

// Middleware
app.use(express.json());

// Config Routes
testRoutes(app);

// Khởi tạo dữ liệu mẫu khi server khởi động
seedData()
  .then(() => {
    console.log("Seed data initialized successfully");
  })
  .catch((error) => {
    console.error("Error initializing seed data:", error);
  });

// Start server
app.listen(port, () => {
  console.log(`User service is running on port ${port}`);
});
