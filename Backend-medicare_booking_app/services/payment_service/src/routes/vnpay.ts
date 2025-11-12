import express from "express";
import {
  createVNPayPayment,
  vnpIpn,
  vnpReturn,
} from "src/controller/vnpay";

const router = express.Router();
// Basic doctor operations
router.post("/create", createVNPayPayment);
router.get("/return", vnpReturn);
router.get("/ipn", vnpIpn); // VNPay gửi IPN qua GET, không phải POST

export default router;
