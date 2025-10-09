import express, { Express } from "express";
import {
  getMessagesByConversationIdAPI,
  getAllConversationsPatientAPI,
  getAllConversationsDoctorAPI,
  createOrGetConversationAPI,
  getConversationsByRoleAPI,
  sendMessageAPI,
  markMessagesAsReadAPI,
  getUnreadCountAPI,
} from "src/controllers/messageControllers";

const router = express.Router();

const messageRoutes = (app: Express) => {
  // API tạo hoặc lấy conversation giữa doctor và patient
  router.post("/conversations", createOrGetConversationAPI);

  // API lấy danh sách conversations theo role (DOCTOR|PATIENT)
  router.get("/conversations/:role/:userId", getConversationsByRoleAPI);

  // API gửi tin nhắn
  router.post("/messages", sendMessageAPI);

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
