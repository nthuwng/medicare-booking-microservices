import { Request, Response } from "express";
import { prisma } from "src/config/client";
import { publishUpdatePaymentStatus } from "src/queue/publishers/appointmentEventUpdate";
import { updatePaymentStatusViaRabbitMQ } from "src/queue/publishers/payment.publisher";
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");

const vnpay = new VNPay({
  tmnCode: "7HSAB3FG",
  secureSecret: "LCPUOLAM30S5A0FX5E5TY6JVPDY2ISEC",
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true
  hashAlgorithm: "SHA512", // tùy chọn
  loggerFn: ignoreLogger,
});

const createVNPayPayment = async (req: Request, res: Response) => {
  const { appointmentId, amount, returnUrl } = req.body;
  // txnRef có thể nhúng appointmentId để tra cứu nhanh
  const txnRef = `APPT-${appointmentId}-${Date.now()}`;

  // VNPay yêu cầu vnp_Amount = số tiền * 100 (đơn vị: “xu”)
  const vnpAmount = Number(amount);

  const url = await vnpay.buildPaymentUrl({
    vnp_Amount: vnpAmount,
    vnp_IpAddr: req.ip || "127.0.0.1",
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: `Thanh toán lịch hẹn ${appointmentId}`,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: returnUrl, // ví dụ FE: https://fe/checkout/vnpay-return
    vnp_Locale: VnpLocale.VN,
    vnp_CreateDate: dateFormat(new Date()),
  });

  await prisma.payment.create({
    data: {
      appointmentId,
      txnRef,
      amount: Number(amount), // lưu VND “đơn vị đồng” để dễ đọc
      orderInfo: `Thanh toán lịch hẹn ${appointmentId}`,
      state: "PENDING",
    },
  });

  res.json({ data: { paymentUrl: url, txnRef } });
};

const vnpReturn = async (req: Request, res: Response) => {
  try {
    const isValid = vnpay.verifyReturnUrl(req.query); // lib hỗ trợ
    const txnRef = String(req.query["vnp_TxnRef"] || "");
    const rspCode = String(req.query["vnp_ResponseCode"] || "");
    if (!isValid) {
      res.status(400).json({ ok: false, message: "Invalid signature" });
    }

    // Simulate IPN call for development (since VNPay can't reach localhost)
    const mockIpnRequest = {
      query: req.query,
    } as Request;
    const mockIpnResponse = {
      json: () => {}, // IPN response not needed in return flow
    } as Response;

    // Call IPN logic internally
    await vnpIpn(mockIpnRequest, mockIpnResponse);

    res.json({
      ok: true,
      data: {
        txnRef,
        rspCode,
      },
      note: "Payment processed via simulated IPN",
    });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Return error" });
  }
};
const vnpIpn = async (req: Request, res: Response) => {
  try {
    const isValid = vnpay.verifyIpnCall(req.query); // xác thực chữ ký

    if (!isValid) {
      res.json({ RspCode: "97", Message: "Invalid signature" });
      return;
    }

    const txnRef = String(req.query["vnp_TxnRef"]);
    const rspCode = String(req.query["vnp_ResponseCode"]); // "00" là thành công

    // Note: bankCode and payDate not used in current implementation

    const payment = await prisma.payment.findUnique({ where: { txnRef } });
    if (!payment) {
      res.json({ RspCode: "01", Message: "Order not found" });
      return;
    }

    // idempotent: nếu đã PAID thì trả OK luôn
    if (payment.state === "PAID") {
      res.json({ RspCode: "00", Message: "Already confirmed" });
      return;
    }

    // const success = rspCode === "00" && transStatus === "00";
    const success = rspCode === "00"; // Chỉ cần ResponseCode = "00"
    const newState = success ? "PAID" : "FAILED";

    try {
      await prisma.payment.update({
        where: { txnRef },
        data: {
          state: newState,
          // Simplified: only update essential fields
        },
      });

      // Nếu thanh toán thành công, gửi message qua RabbitMQ để cập nhật Appointment Service
      if (success) {
        try {
          await updatePaymentStatusViaRabbitMQ(payment.appointmentId);
          console.log(
            `✅ Đã gửi message cập nhật payment status cho appointment ${payment.appointmentId}`
          );
        } catch (mqError) {
          console.error("❌ Lỗi khi gửi message qua RabbitMQ:", mqError);
          // Không throw error vì payment đã thành công
        }
      }
    } catch (updateError) {
      res.json({ RspCode: "99", Message: "Database update failed" });
      return;
    }

    res.json({ RspCode: "00", Message: "Confirm success" });
  } catch (e) {
    res.json({ RspCode: "99", Message: "Unknown error" });
  }
};

export { createVNPayPayment, vnpReturn, vnpIpn };
