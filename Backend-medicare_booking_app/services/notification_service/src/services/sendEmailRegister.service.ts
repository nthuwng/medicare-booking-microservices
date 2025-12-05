import dayjs from "dayjs";
import sendEmail from "src/helpers/email.sender";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

function generateEmailOTPHtml(email: string, otp: string) {
  const logoDataUri = `https://res.cloudinary.com/dwevfv0is/image/upload/v1762418766/LOGO_MEDICARE_iz1guo.png`;
  return `
  <!DOCTYPE html>
  <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Xác nhận OTP</title>
    </head>
    <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; margin: 0; padding: 0; background: #f6f7fb;">
      <div style="padding: 24px 12px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #eaecef; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">
          <div style="padding: 24px; text-align: center; border-bottom: 1px solid #f0f1f3;">
            <img src="${logoDataUri}" style="max-width: 120px; margin-bottom: 20px;" alt="Logo Medicare"/>
            <h2 style="color: #0c6efd; margin: 0 0 8px 0; font-size: 24px;">Xác nhận OTP để đăng kí tài khoản</h2>
            <h2 style="color: #333; margin: 0 0 20px; font-size: 18px;">Xin chào ${email}! 👋</h2>
            <p style="margin: 0; color: #56637a; font-size: 14px;">
              Bạn đã yêu cầu mã OTP để đăng kí tài khoản trên hệ thống <b style="font-size: 16px; color: #0c6efd;">Medicare Booking</b>.
            </p>
          </div>

          <div style="padding: 16px 24px 24px 24px;">
            <div style="background-color: #e3f2fd; color: #1e88e5; font-size: 30px; text-align: center; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
              Mã xác minh của bạn: <strong>${otp}</strong>
            </div>

            <div style="background-color: #fff8e1; padding: 10px; border-radius: 8px; margin-top: 20px; font-size: 14px;">
              <p style="margin: 0;"><strong>Lưu ý quan trọng:</strong></p>
              <ul style="margin: 0; padding-left: 20px;">
                <li style="margin: 5px 0;">Mã OTP có hiệu lực trong <strong>3 phút</strong></li>
                <li style="margin: 5px 0;">Không chia sẻ mã này với bất kỳ ai</li>
                <li style="margin: 5px 0;">Nếu không nhận được mã, vui lòng kiểm tra thư mục Spam</li>
              </ul>
            </div>

            <p style="margin-top: 16px; font-size: 14px; color: #56637a;">
              Trân trọng,<br />
              Đội ngũ Medicare Booking
            </p>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}

export async function sendEmailOTPRegister(email: string, otp: string) {
  const subject = "Xác nhận OTP";
  const html = generateEmailOTPHtml(email, otp);
  await sendEmail({ email, subject, html });
}

export const EmailService = {
  sendEmailOTPRegister,
};
