import cron from "node-cron";

import { prisma } from "../config/client";

/**
 * Xoá refresh_token đã:
 *   - hết hạn (expiresAt < NOW)
 *   - hoặc bị thu hồi (isRevoked = true)
 * Lịch: chạy 03:00 sáng mỗi ngày.
 */
export const startCleanupRefreshTokensJob = () => {
  cron.schedule("0 3 * * *", async () => {
    try {
      const deleted = await prisma.refreshToken.deleteMany({
        where: {
          OR: [{ isRevoked: true }, { expiresAt: { lt: new Date() } }],
        },
      });
      console.log(`[CRON] 🧹 refresh_tokens cleaned: ${deleted.count}`);
    } catch (err) {
      console.error("[CRON] cleanup refresh_tokens error:", err);
    }
  });
};
