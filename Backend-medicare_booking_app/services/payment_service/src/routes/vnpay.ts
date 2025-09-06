import express, { Express } from "express";
import { createVNPayPayment, vnpIpn, vnpReturn } from "src/controller/vnpay";

const router = express.Router();

const vnpay = (app: Express) => {
  router.post("/create", createVNPayPayment);
  router.get("/return", vnpReturn);
  router.get("/ipn", vnpIpn); // VNPay gửi IPN qua GET, không phải POST

  app.use("/vnpay", router);
};

export default vnpay;
