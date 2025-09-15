import express, { Express } from "express";
import {
  getConversationByDoctorIdAPI,
  getMessagesByConversationIdAPI,
  getAllConversationsAPI
} from "src/controllers/messageControllers";

const router = express.Router();

const messageRoutes = (app: Express) => {
  // API lấy conversation theo doctorId
  router.get("/conversations/:doctorId", getConversationByDoctorIdAPI);
  router.get(
    "/by-conversation-id/:conversationId",
    getMessagesByConversationIdAPI
  );
  router.get("/conversations/patient/:patientId", getAllConversationsAPI);

  app.use("/", router);
};

export default messageRoutes;
