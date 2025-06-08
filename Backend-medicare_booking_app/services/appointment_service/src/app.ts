import express from "express";
import "dotenv/config";
import testRoutes from "./routes/testRoutes";

const app = express();
const port = process.env.PORT || 8082;

//config Routes
testRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
