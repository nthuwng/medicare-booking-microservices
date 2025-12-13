import { Express } from "express";
import vnpay from "./vnpay";
import cash from "./cash";
import payment from "./payment";

const routers = (app: Express) => {
  app.use("/vnpay", vnpay);
  app.use("/cash", cash);
  app.use("/payments", payment);
};

export default routers;
