import express from "express";
import { createCashPayment } from "src/controller/vnpay";

const router = express.Router();
// Basic doctor operations
router.post("/create", createCashPayment);

export default router;
