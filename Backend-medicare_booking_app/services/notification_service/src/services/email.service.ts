import dayjs from "dayjs";
import sendEmail from "src/helpers/email.sender";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

export interface AppointmentEmailData {
  appointmentId: string;
  patientName: string;
  patientPhone?: string;
  appointmentDateTime: string;
  doctorName?: string;
  specialtyName?: string;
  clinicName?: string;
  location?: string;
  reason?: string;
  totalFee?: number;
}

function generateAppointmentCreatedHtml(data: AppointmentEmailData) {
  const {
    appointmentId,
    patientName,
    patientPhone,
    appointmentDateTime,
    doctorName,
    specialtyName,
    clinicName,
    location,
    reason,
    totalFee,
  } = data;

  const money = typeof totalFee === "string" ? `${totalFee} VND` : "-";

  const isUTCInput = /Z$/i.test(appointmentDateTime);
  const localParsed = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(
    appointmentDateTime
  );

  const formattedDate = (() => {
    return dayjs.utc(appointmentDateTime).format("DD/MM/YYYY");
  })();

  const formattedTime = (() => {
    return dayjs.utc(appointmentDateTime).format("HH:mm");
  })();

  const logoDataUri = `https://res.cloudinary.com/dwevfv0is/image/upload/v1762418766/LOGO_MEDICARE_iz1guo.png`;

  return `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận đặt lịch</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0f4f8;padding:40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
            
            <!-- Header with Logo & Brand -->
            <tr>
              <td style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:32px 40px;text-align:center;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center" style="padding-bottom:16px;">
                      <img src="${logoDataUri}" alt="MediCare Logo" width="80" height="80" style="display:block;border-radius:12px;background:#ffffff;padding:8px;" />
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">MediCare Booking</h1>
                      <p style="margin:8px 0 0 0;color:rgba(255,255,255,0.9);font-size:14px;font-weight:500;">Hệ thống đặt lịch khám bệnh trực tuyến</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Success Badge -->
            <tr>
              <td align="center" style="padding:32px 40px 24px;">
                <div style="display:inline-block;background:#10b981;color:#ffffff;padding:12px 24px;border-radius:50px;font-size:14px;font-weight:600;letter-spacing:0.5px;">
                  ✓ ĐẶT LỊCH THÀNH CÔNG
                </div>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding:0 40px 24px;">
                <h2 style="margin:0 0 12px 0;color:#1e293b;font-size:22px;font-weight:700;text-align:center;">Xin chào, ${patientName}!</h2>
                <p style="margin:0;color:#64748b;font-size:15px;line-height:24px;text-align:center;">Lịch hẹn của bạn đã được xác nhận thành công. Dưới đây là thông tin chi tiết:</p>
              </td>
            </tr>

            <!-- Appointment Details Card -->
            <tr>
              <td style="padding:0 40px 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border-radius:12px;border:2px solid #e2e8f0;overflow:hidden;">
                  
                  <!-- Appointment ID Highlight -->
                  <tr>
                    <td colspan="2" style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:16px 20px;text-align:center;">
                      <p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Mã lịch hẹn</p>
                      <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;font-family:'Courier New',monospace;letter-spacing:1px;">${appointmentId.slice(
                        0,
                        8
                      )}</p>
                    </td>
                  </tr>

                  <!-- Date & Time Row -->
                  <tr>
                    <td style="padding:20px;width:50%;border-right:1px solid #e2e8f0;">
                      <p style="margin:0 0 6px 0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">📅 Ngày khám</p>
                      <p style="margin:0;color:#1e293b;font-size:16px;font-weight:700;">${formattedDate}</p>
                    </td>
                    <td style="padding:20px;width:50%;">
                      <p style="margin:0 0 6px 0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">🕐 Giờ khám</p>
                      <p style="margin:0;color:#1e293b;font-size:16px;font-weight:700;">${formattedTime}</p>
                    </td>
                  </tr>

                  ${
                    doctorName
                      ? `<tr><td colspan="2" style="padding:16px 20px;border-top:1px solid #e2e8f0;"><p style="margin:0 0 6px 0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">👨‍⚕️ Bác sĩ</p><p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${doctorName}${
                          specialtyName
                            ? ` <span style="color:#8b5cf6;">• ${specialtyName}</span>`
                            : ""
                        }</p></td></tr>`
                      : ""
                  }

                  ${
                    clinicName
                      ? `<tr><td colspan="2" style="padding:16px 20px;border-top:1px solid #e2e8f0;"><p style="margin:0 0 6px 0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">🏥 Cơ sở khám</p><p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${clinicName}</p></td></tr>`
                      : ""
                  }

                  ${
                    location
                      ? `<tr><td colspan="2" style="padding:16px 20px;border-top:1px solid #e2e8f0;"><p style="margin:0 0 6px 0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">📍 Địa chỉ</p><p style="margin:0;color:#475569;font-size:14px;line-height:20px;">${location}</p></td></tr>`
                      : ""
                  }

                  ${
                    patientPhone
                      ? `<tr><td colspan="2" style="padding:16px 20px;border-top:1px solid #e2e8f0;"><p style="margin:0 0 6px 0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">📞 Số điện thoại</p><p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${patientPhone}</p></td></tr>`
                      : ""
                  }

                  ${
                    reason
                      ? `<tr><td colspan="2" style="padding:16px 20px;border-top:1px solid #e2e8f0;"><p style="margin:0 0 6px 0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">📋 Lý do khám</p><p style="margin:0;color:#475569;font-size:14px;line-height:20px;">${reason}</p></td></tr>`
                      : ""
                  }

                  <!-- Total Fee -->
                  <tr>
                    <td colspan="2" style="padding:20px;border-top:2px solid #e2e8f0;background:#ffffff;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding:0;">
                            <p style="margin:0;color:#64748b;font-size:13px;font-weight:600;">Chi phí dự kiến</p>
                          </td>
                          <td align="right" style="padding:0;">
                            <p style="margin:0;color:#8b5cf6;font-size:20px;font-weight:700;">${money}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>

            <!-- Important Notes -->
            <tr>
              <td style="padding:0 40px 32px;">
                <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:8px;">
                  <p style="margin:0 0 8px 0;color:#92400e;font-size:14px;font-weight:700;">⚠️ Lưu ý quan trọng:</p>
                  <ul style="margin:0;padding-left:20px;color:#78350f;font-size:13px;line-height:22px;">
                    <li>Vui lòng đến trước giờ hẹn <strong>15-20 phút</strong></li>
                    <li>Mang theo <strong>giấy tờ tùy thân</strong> và <strong>thẻ BHYT</strong> (nếu có)</li>
                    <li>Liên hệ CSKH nếu cần thay đổi lịch hẹn</li>
                  </ul>
                </div>
              </td>
            </tr>

            <!-- Support Info -->
            <tr>
              <td style="padding:0 40px 32px;">
                <div style="background:#eff6ff;border:1px solid #dbeafe;border-radius:8px;padding:20px;text-align:center;">
                  <p style="margin:0 0 12px 0;color:#1e40af;font-size:14px;font-weight:600;">💬 Cần hỗ trợ?</p>
                  <p style="margin:0;color:#3b82f6;font-size:13px;">Hotline: <strong style="font-size:16px;">1900 xxxx</strong></p>
                  <p style="margin:8px 0 0 0;color:#60a5fa;font-size:13px;">Email: <strong>support@medicare.vn</strong></p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                <p style="margin:0 0 8px 0;color:#64748b;font-size:13px;line-height:20px;">Trân trọng,<br/><strong style="color:#1e293b;">Đội ngũ MediCare Booking</strong></p>
                <p style="margin:16px 0 0 0;color:#94a3b8;font-size:11px;">© 2025 MediCare Booking. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

export async function sendAppointmentCreatedEmail(
  toEmail: string,
  data: AppointmentEmailData
) {
  const subject = "Xác nhận đặt lịch hẹn thành công";
  const html = generateAppointmentCreatedHtml(data);
  await sendEmail({ email: toEmail, subject, html });
}

export const EmailService = {
  sendAppointmentCreatedEmail,
};
