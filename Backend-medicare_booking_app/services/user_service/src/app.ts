import express from "express";
import "dotenv/config";
import testRoutes from "./routes/api";

const app = express();
const port = process.env.PORT || 8081;

// Middleware
app.use(express.json());

// Config Routes
testRoutes(app);

// Start server
app.listen(port, () => {
  console.log(`User service is running on port ${port}`);
});
