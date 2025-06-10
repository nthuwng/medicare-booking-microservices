import express, { Express } from "express";
import testController from "../controller/api";

const router = express.Router();

const testRoutes = (app: Express) => {
  router.get("/", testController);

  app.use("/test", router);
};

export default testRoutes;
