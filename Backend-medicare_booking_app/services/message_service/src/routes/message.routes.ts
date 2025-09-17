import express, { Express } from "express";
import {
  getMessagesByConversationIdAPI,
  getAllConversationsPatientAPI,
  getAllConversationsDoctorAPI,
} from "src/controllers/messageControllers";

const router = express.Router();

const messageRoutes = (app: Express) => {
  // API lấy conversation theo doctorId
  router.get(
    "/by-conversation-id/:conversationId",
    getMessagesByConversationIdAPI
  );
  router.get(
    "/conversations/patient/:patientId",
    getAllConversationsPatientAPI
  );
  router.get("/conversations/doctor/:doctorId", getAllConversationsDoctorAPI);

  app.use("/", router);
};

export default messageRoutes;
