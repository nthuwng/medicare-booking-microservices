import { AuthVerifyResponse } from "../../../shared/index";
import { verifyJwtToken } from "../../services/auth.services";
import { getChannel } from "../connection";

// Khởi tạo consumer để lắng nghe queue "auth.get_user"
export const initAuthVerifyTokenConsumer = async () => {
  const channel = getChannel(); // lấy channel đã connect trước đó

  await channel.assertQueue("auth.verify_token", { durable: false });

  channel.consume("auth.verify_token", async (msg) => {
    if (!msg) return;
    let response: AuthVerifyResponse;
    try {
      const { token } = JSON.parse(msg.content.toString());
      try {
        const user = await verifyJwtToken(token);

        response = {
          success: true,
          message: "Token hợp lệ",
          data: {
            userId: user.userId,
            email: user.email,
            userType: user.userType,
            isValid: true,
            iat: user.iat,
            exp: user.exp,
          },
        };
      } catch (error: any) {
        response = {
          success: false,
          message: "Token không hợp lệ hoặc đã hết hạn",
          data: {
            userId: null,
            email: null,
            userType: null,
            isValid: false,
            iat: "0",
            exp: "0",
          },
        };
      }

      //   Gửi phản hồi đến queue được chỉ định trong `replyTo`
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(response)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing auth.verify_token:", err);
      channel.nack(msg, false, false); // bỏ qua message lỗi
    }
  });
};
