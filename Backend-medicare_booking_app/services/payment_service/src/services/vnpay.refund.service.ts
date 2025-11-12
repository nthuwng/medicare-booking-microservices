import crypto from "crypto";
import { prisma } from "src/config/client";
import { PaymentState } from "@prisma/client";

interface RefundData {
  id: string;
  txnRef: string;
  transactionNo: string;
  amount: number;
  transactionDate: string;
  appointmentId: string;
}

/**
 * VNPay Refund Service
 * Xử lý hoàn tiền qua VNPay API
 */
class VNPayRefundService {
  private vnp_TmnCode: string;
  private vnp_HashSecret: string;
  private vnp_Api: string;

  constructor() {
    this.vnp_TmnCode = process.env.VNP_TMN_CODE || "";
    this.vnp_HashSecret = process.env.VNP_HASH_SECRET || "";
    // VNPay Refund API endpoint
    this.vnp_Api =
      process.env.VNP_API_REFUND ||
      "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
  }

  /**
   * Process VNPay refund
   */
  async processRefund(refundData: RefundData): Promise<{
    success: boolean;
    message: string;
    refundResponse?: any;
  }> {
    try {

      // Generate refund request parameters
      const requestId = this.generateRequestId();
      const createDate = this.getCurrentDateTime();

      const vnpParams: Record<string, string> = {
        vnp_RequestId: requestId,
        vnp_Version: "2.1.0",
        vnp_Command: "refund",
        vnp_TmnCode: this.vnp_TmnCode,
        vnp_TransactionType: "02", // 02: Full refund, 03: Partial refund
        vnp_TxnRef: refundData.txnRef,
        vnp_Amount: String(refundData.amount),
        vnp_OrderInfo: `Hoan tien don hang ${refundData.txnRef}`,
        vnp_TransactionNo: refundData.transactionNo,
        vnp_TransactionDate: refundData.transactionDate,
        vnp_CreateDate: createDate,
        vnp_CreateBy: "system",
        vnp_IpAddr: "127.0.0.1",
      };

      // Sort and create secure hash
      const sortedParams = this.sortObject(vnpParams);
      const signData = new URLSearchParams(sortedParams).toString();
      const secureHash = this.createHmacSHA512(signData, this.vnp_HashSecret);
      sortedParams.vnp_SecureHash = secureHash;

      // TODO: Call VNPay API in production
      // For now, simulate success response
      const vnpayResponse = await this.callVNPayRefundAPI(sortedParams);

      // Check response
      if (vnpayResponse.vnp_ResponseCode === "00") {
        // Success: Update payment to CANCELED
        await prisma.payment.update({
          where: { id: refundData.id },
          data: {
            state: "CANCELED" as PaymentState,
            rawQuery: JSON.stringify({
              originalTransaction: {
                txnRef: refundData.txnRef,
                transactionNo: refundData.transactionNo,
              },
              refund: vnpayResponse,
              refundDate: new Date().toISOString(),
            }),
          },
        });

        return {
          success: true,
          message:
            "Hoàn tiền thành công. Tiền sẽ về tài khoản trong 3-5 ngày làm việc",
          refundResponse: vnpayResponse,
        };
      } else {
        // Failed
        const errorMessage =
          vnpayResponse.vnp_Message || "Lỗi không xác định từ VNPay";
        console.error("❌ VNPay refund failed:", errorMessage);

        return {
          success: false,
          message: `Hoàn tiền thất bại: ${errorMessage}`,
          refundResponse: vnpayResponse,
        };
      }
    } catch (error: any) {
      console.error("❌ Error processing VNPay refund:", error);
      return {
        success: false,
        message: `Lỗi xử lý hoàn tiền: ${error.message}`,
      };
    }
  }

  /**
   * Call VNPay Refund API
   * TODO: Implement real API call in production
   */
  private async callVNPayRefundAPI(
    params: Record<string, string>
  ): Promise<any> {
    // MOCK RESPONSE for development
    // In production, uncomment below and use real API

    /*
    const response = await fetch(this.vnp_Api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    return await response.json();
    */

    // Mock successful response for testing
    return {
      vnp_ResponseCode: "00",
      vnp_Message: "Refund successful",
      vnp_TmnCode: params.vnp_TmnCode,
      vnp_TxnRef: params.vnp_TxnRef,
      vnp_Amount: params.vnp_Amount,
      vnp_TransactionNo: params.vnp_TransactionNo,
      vnp_TransactionType: params.vnp_TransactionType,
    };
  }

  // Helper methods
  private generateRequestId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `${timestamp}${random}`;
  }

  private getCurrentDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  private createHmacSHA512(data: string, secretKey: string): string {
    const hmac = crypto.createHmac("sha512", secretKey);
    return hmac.update(Buffer.from(data, "utf-8")).digest("hex");
  }
}

export default new VNPayRefundService();
