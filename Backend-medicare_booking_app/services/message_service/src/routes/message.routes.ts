import express, { Express } from "express";
import multer from "multer";
import {
  getMessagesByConversationIdAPI,
  createOrGetConversationAPI,
  getConversationsByRoleAPI,
  sendMessageAPI,
  markMessagesAsReadAPI,
  getUnreadCountAPI,
} from "src/controllers/messageControllers";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const messageRoutes = (app: Express) => {
  // API tạo hoặc lấy conversation giữa doctor và patient
  router.post("/conversations", createOrGetConversationAPI);

  // API lấy danh sách conversations theo role (DOCTOR|PATIENT)
  router.get("/conversations/:role/:userId", getConversationsByRoleAPI);

  // API gửi tin nhắn
  router.post("/messages", upload.single("image"), sendMessageAPI);

  // API đánh dấu tin nhắn đã đọc
  router.patch("/messages/read", markMessagesAsReadAPI);

  // API đếm tin nhắn chưa đọc
  router.get("/unread-count/:userId", getUnreadCountAPI);

  // API lấy tin nhắn theo conversation ID
  router.get(
    "/by-conversation-id/:conversationId",
    getMessagesByConversationIdAPI
  );
  app.use("/", router);
};

export default messageRoutes;
