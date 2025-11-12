import { getChannel } from "../connection";
import { processCancelAndRefund } from "src/repository/payment";
import vnpayRefundService from "src/services/vnpay.refund.service";

/**
 * Consumer xử lý hủy lịch hẹn và hoàn tiền tự động
 * - CASH: Hủy ngay (không cần hoàn tiền)
 * - VNPAY: Hủy và hoàn tiền tự động nếu đã thanh toán
 */
export const initUpdateCancelPaymentByAppointmentIdConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue("payment.update_cancel_payment_by_appointment_id", {
    durable: false,
  });

  channel.consume(
    "payment.update_cancel_payment_by_appointment_id",
    async (msg) => {
      if (!msg) return;

      try {
        const { appointmentId } = JSON.parse(msg.content.toString());

        // Process cancel and check if refund is needed
        const result = await processCancelAndRefund(appointmentId);


        // If VNPay refund is required, process it
        if (result.refundRequired && result.paymentData) {

          const refundResult = await vnpayRefundService.processRefund(
            result.paymentData
          );


          // Send combined result back
          const finalResult = {
            success: refundResult.success,
            message: refundResult.message,
            gateway: result.gateway,
            refundProcessed: true,
            refundResponse: refundResult.refundResponse,
          };

          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(finalResult)),
            {
              correlationId: msg.properties.correlationId,
            }
          );
        } else {
          // CASH or VNPay not paid yet - just send cancel result
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(result)),
            {
              correlationId: msg.properties.correlationId,
            }
          );
        }

        channel.ack(msg);
      } catch (err: any) {
        console.error(
          "❌ Error processing payment.update_cancel_payment_by_appointment_id:",
          err
        );

        // Send error response
        const errorResult = {
          success: false,
          message: err.message || "Lỗi xử lý hủy thanh toán",
        };

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(errorResult)),
          {
            correlationId: msg.properties.correlationId,
          }
        );

        channel.ack(msg); // Ack để không retry (có thể log vào DB để xử lý manual)
      }
    }
  );
};
