import express, { Express } from "express";
import {
  createVNPayPayment,
  vnpIpn,
  vnpReturn,
  refundPayment,
} from "src/controller/vnpay";

const router = express.Router();

const vnpay = (app: Express) => {
  router.post("/create", createVNPayPayment);
  router.get("/return", vnpReturn);
  router.get("/ipn", vnpIpn); // VNPay gửi IPN qua GET, không phải POST
  router.post("/refund", refundPayment);

  app.use("/vnpay", router);
};

export default vnpay;
