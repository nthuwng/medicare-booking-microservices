import { PaymentGateway, PaymentState } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "src/config/client";
import { updatePaymentStatusViaRabbitMQ } from "src/queue/publishers/payment.publisher";
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");

const vnpay = new VNPay({
  tmnCode: "DFCSD3DL",
  secureSecret: "B05LJYKHPOZTXEQVIWOGDRMTT7C1G4T4",
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

  const checkExisting = await prisma.payment.findFirst({
    where: { appointmentId, gateway: "CASH", amount: Number(amount) },
  });

  if (checkExisting) {
    await prisma.payment.update({
      where: { id: checkExisting.id },
      data: {
        txnRef,
        orderInfo: `Thanh toán lịch hẹn ${appointmentId}`,
        gateway: "VNPAY" as PaymentGateway,
        state: "PENDING" as PaymentState,
      },
    });
    res.json({ data: { paymentUrl: url, txnRef } });
    return;
  }

  await prisma.payment.create({
    data: {
      appointmentId,
      txnRef,
      amount: Number(amount), // lưu VND “đơn vị đồng” để dễ đọc
      orderInfo: `Thanh toán lịch hẹn ${appointmentId}`,
      gateway: "VNPAY" as PaymentGateway,
      state: "PENDING" as PaymentState,
    },
  });

  res.json({ data: { paymentUrl: url, txnRef } });
};

const refundPayment = async (req: Request, res: Response) => {
  const { txnRef, amount, refundReason } = req.body;

  try {
    // 1. Kiểm tra payment tồn tại và đã thanh toán thành công
    const payment = await prisma.payment.findUnique({
      where: { txnRef: String(txnRef) },
    });

    if (!payment) {
      res.status(404).json({
        ok: false,
        message: "Payment not found",
      });
      return;
    }

    if (payment.state !== "PAID") {
      res.status(400).json({
        ok: false,
        message: `Cannot refund payment with state: ${payment.state}`,
      });
      return;
    }

    // 2. Kiểm tra số tiền hoàn trả
    const refundAmount = Number(amount) || payment.amount;
    if (refundAmount > payment.amount) {
      res.status(400).json({
        ok: false,
        message: `Refund amount (${refundAmount}) exceeds payment amount (${payment.amount})`,
      });
      return;
    }

    // 3. Kiểm tra có transactionDate (BẮT BUỘC theo tài liệu VNPay)
    if (!payment.transactionDate) {
      res.status(400).json({
        ok: false,
        message: "Payment missing transaction date. Cannot refund.",
        note: "vnp_TransactionDate is required for refund (format: yyyyMMddHHmmss)",
      });
      return;
    }

    // 4. Gọi VNPay API để hoàn tiền
    const refundTxnRef = `REFUND-${txnRef}-${Date.now()}`;

    const refundResponse = await vnpay.refund({
      vnp_RequestId: refundTxnRef, // Mã yêu cầu hoàn tiền (duy nhất trong ngày)
      vnp_Version: "2.1.0", // Phiên bản API
      vnp_Command: "refund", // Command refund
      vnp_TmnCode: "7HSAB3FG", // Mã merchant
      vnp_TransactionType: "02", // 02: Hoàn toàn phần, 03: Hoàn một phần
      vnp_TxnRef: payment.txnRef, // ✅ Mã giao dịch GỐC (không phải refundTxnRef)
      vnp_Amount: refundAmount, // Số tiền hoàn (VND)
      vnp_OrderInfo: refundReason || `Hoàn tiền cho giao dịch ${txnRef}`,
      vnp_TransactionNo: payment.transactionNo || "", // Tùy chọn: Mã giao dịch VNPay
      vnp_TransactionDate: payment.transactionDate, // ✅ BẮT BUỘC: Ngày giao dịch gốc (yyyyMMddHHmmss)
      vnp_CreateBy: "admin", // Người tạo yêu cầu
      vnp_CreateDate: dateFormat(new Date()), // Ngày tạo yêu cầu hoàn tiền
      vnp_IpAddr: req.ip || "127.0.0.1",
    });

    // 4. Cập nhật trạng thái payment (tùy chọn: tạo bảng Refund riêng)
    await prisma.payment.update({
      where: { txnRef },
      data: {
        state: "CANCELED", // hoặc tạo state mới: REFUNDED
      },
    });

    res.json({
      success: true,
      data: {
        txnRef,
        refundTxnRef,
        refundAmount,
        refundResponse,
      },
      message: "Refund request submitted successfully",
    });
  } catch (e: any) {
    console.error("❌ Refund Error:", e);
    res.status(500).json({
      ok: false,
      message: "Refund error",
      error: e.message || e,
    });
  }
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
    const transactionNo = String(req.query["vnp_TransactionNo"] || ""); // ← MÃ GIAO DỊCH VNPAY (BẮT BUỘC ĐỂ REFUND)
    const transactionDate = String(req.query["vnp_PayDate"] || ""); // ← NGÀY GIAO DỊCH (BẮT BUỘC ĐỂ REFUND)
    const bankCode = String(req.query["vnp_BankCode"] || "");

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
          transactionNo, // ← LƯU MÃ GIAO DỊCH VNPAY
          transactionDate, // ← LƯU NGÀY GIAO DỊCH
          bankCode,
          payDate: transactionDate
            ? new Date(
                transactionDate.slice(0, 4) +
                  "-" +
                  transactionDate.slice(4, 6) +
                  "-" +
                  transactionDate.slice(6, 8) +
                  "T" +
                  transactionDate.slice(8, 10) +
                  ":" +
                  transactionDate.slice(10, 12) +
                  ":" +
                  transactionDate.slice(12, 14)
              )
            : null,
        },
      });

      // Nếu thanh toán thành công, gửi message qua RabbitMQ để cập nhật Appointment Service
      if (success) {
        try {
          await updatePaymentStatusViaRabbitMQ(payment.appointmentId);
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

const createCashPayment = async (req: Request, res: Response) => {
  const { appointmentId, amount } = req.body;
  const txnRef = `CASH-${appointmentId}-${Date.now()}`;
  const checkExisting = await prisma.payment.findFirst({
    where: { appointmentId, gateway: "CASH", amount: Number(amount) },
  });

  if (checkExisting) {
    res.json({
      success: true,
      message: "Vui lòng đến quầy thu ngân để hoàn tất thanh toán.",
    });
    return;
  } else {
    await prisma.payment.create({
      data: {
        appointmentId,
        txnRef,
        amount: Number(amount), // lưu VND “đơn vị đồng” để dễ đọc
        orderInfo: `Thanh toán tiền mặt cho lịch hẹn ${appointmentId}`,
        state: "PENDING" as PaymentState, // Tiền mặt mặc định là chưa thanh toán
        gateway: "CASH" as PaymentGateway,
      },
    });
    res.json({
      success: true,
      message: "Vui lòng đến quầy thu ngân để hoàn tất thanh toán.",
    });
  }
};

/**
 * Check refund status by appointmentId
 * GET /api/payment/refund-status/:appointmentId
 */
const getRefundStatus = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;

    const payment = await prisma.payment.findFirst({
      where: { appointmentId },
      select: {
        id: true,
        appointmentId: true,
        txnRef: true,
        transactionNo: true,
        amount: true,
        gateway: true,
        state: true,
        rawQuery: true,
        payDate: true,
        updatedAt: true,
      },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Payment not found for this appointment",
      });
      return;
    }

    // Parse refund info from rawQuery
    let refundInfo = null;
    if (payment.rawQuery) {
      try {
        const parsed = JSON.parse(payment.rawQuery);
        if (parsed.refund) {
          refundInfo = {
            refundDate: parsed.refundDate,
            vnpayResponse: parsed.refund,
            originalTransaction: parsed.originalTransaction,
          };
        }
      } catch (e) {
        console.error("Error parsing rawQuery:", e);
      }
    }

    // Determine refund status
    const isRefunded = payment.state === "CANCELED" && refundInfo !== null;
    const isCanceled = payment.state === "CANCELED" && refundInfo === null;

    res.json({
      success: true,
      data: {
        appointmentId: payment.appointmentId,
        txnRef: payment.txnRef,
        transactionNo: payment.transactionNo,
        amount: payment.amount,
        gateway: payment.gateway,
        state: payment.state,
        payDate: payment.payDate,
        updatedAt: payment.updatedAt,
        refundStatus: {
          isRefunded, // true = đã hoàn tiền
          isCanceled, // true = đã hủy nhưng chưa thanh toán (không cần refund)
          refundInfo, // Chi tiết refund nếu có
        },
      },
      message: isRefunded
        ? "Đã hoàn tiền thành công"
        : isCanceled
        ? "Đã hủy (không cần hoàn tiền)"
        : payment.state === "PAID"
        ? "Đã thanh toán (chưa hủy)"
        : "Chưa thanh toán",
    });
  } catch (error: any) {
    console.error("Error checking refund status:", error);
    res.status(500).json({
      success: false,
      message: "Error checking refund status",
      error: error.message,
    });
  }
};

export {
  createVNPayPayment,
  vnpReturn,
  vnpIpn,
  refundPayment,
  createCashPayment,
  getRefundStatus,
};
