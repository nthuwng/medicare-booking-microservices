import { Express } from "express";
import vnpay from "./vnpay";
import cash from "./cash";

const routers = (app: Express) => {
  app.use("/vnpay", vnpay);
  app.use("/cash", cash);
};

export default routers;
