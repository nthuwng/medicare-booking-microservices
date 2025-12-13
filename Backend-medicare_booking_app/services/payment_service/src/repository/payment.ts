import { createPaymentDefaultConsumer } from "./../queue/consumer/createPaymentDefault";
import { PaymentGateway, PaymentState } from "@prisma/client";
import { prisma } from "src/config/client";

const getPaymentByAppointmentId = async (appointmentId: string) => {
  const payment = await prisma.payment.findFirst({
    where: { appointmentId },
  });

  // Return null if payment not found (e.g., appointment created but payment not yet initiated)
  return payment || null;
};

const updateCancelPaymentByAppointmentId = async (appointmentId: string) => {
  const payment = await prisma.payment.updateMany({
    where: { appointmentId },
    data: { state: "CANCELED" as PaymentState },
  });
  return payment;
};

/**
 * Process cancel and refund based on payment gateway
 * - CASH: Cancel immediately (no refund needed)
 * - VNPAY: Cancel and process refund if already paid
 */
const processCancelAndRefund = async (appointmentId: string) => {
  // 1. Get payment by appointmentId
  const payment = await prisma.payment.findFirst({
    where: { appointmentId },
  });

  if (!payment) {
    throw new Error("Payment not found for appointmentId: " + appointmentId);
  }

  // 2. Check if already canceled
  if (payment.state === "CANCELED") {
    return {
      success: true,
      alreadyCanceled: true,
      message: "Payment already canceled",
      gateway: payment.gateway,
    };
  }

  // 3. Process based on gateway type
  if (payment.gateway === "CASH") {
    // CASH: Just cancel (no payment made yet)
    await prisma.payment.update({
      where: { id: payment.id },
      data: { state: "CANCELED" as PaymentState },
    });

    return {
      success: true,
      gateway: "CASH",
      message: "Đã hủy lịch hẹn thành công",
      refundRequired: false,
    };
  } else if (payment.gateway === "VNPAY") {
    // VNPAY: Check if paid
    if (payment.state !== "PAID") {
      // Not paid yet, just cancel
      await prisma.payment.update({
        where: { id: payment.id },
        data: { state: "CANCELED" as PaymentState },
      });

      return {
        success: true,
        gateway: "VNPAY",
        message: "Đã hủy lịch hẹn thành công (chưa thanh toán)",
        refundRequired: false,
      };
    }

    // Already paid, need refund
    // Check required fields for VNPay refund
    if (!payment.transactionNo || !payment.transactionDate) {
      throw new Error("Không thể hoàn tiền: Thiếu thông tin giao dịch VNPay");
    }

    // Return payment data for refund processing
    return {
      success: true,
      gateway: "VNPAY",
      message: "Cần xử lý hoàn tiền VNPay",
      refundRequired: true,
      paymentData: {
        id: payment.id,
        txnRef: payment.txnRef,
        transactionNo: payment.transactionNo,
        amount: payment.amount,
        transactionDate: payment.transactionDate,
        appointmentId: payment.appointmentId,
      },
    };
  }

  throw new Error(`Unsupported payment gateway: ${payment.gateway}`);
};

const createPaymentDefault = async (
  appointmentId: string,
  amount: string,
  hospitalId: string,
  patientId: string
) => {
  const txnRef = `CASH-${appointmentId}-${Date.now()}`;

  await prisma.payment.create({
    data: {
      appointmentId,
      txnRef,
      amount: Number(amount), // lưu VND “đơn vị đồng” để dễ đọc
      orderInfo: `Thanh toán tiền mặt cho lịch hẹn ${appointmentId}`,
      state: "PENDING" as PaymentState, // Tiền mặt mặc định là chưa thanh toán
      gateway: "CASH" as PaymentGateway,
      hospitalId: String(hospitalId),
      patientId,
    },
  });
};

export {
  createPaymentDefault,
  getPaymentByAppointmentId,
  updateCancelPaymentByAppointmentId,
  processCancelAndRefund,
};
