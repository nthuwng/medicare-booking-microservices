
import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.routes";

const app = express();
const port = process.env.PORT || 8086;

// Middleware để parse JSON và form data
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse form data

//config Routes
authRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
