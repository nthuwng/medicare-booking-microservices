import express from "express";
import { getAllPayments } from "src/controller/paymentController";


const router = express.Router();
// Basic doctor operations
router.get("/", getAllPayments);

export default router;
