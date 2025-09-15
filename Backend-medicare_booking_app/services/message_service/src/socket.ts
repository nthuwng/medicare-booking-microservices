import { Server } from "socket.io";
import {
  createConversationService,
  createMessageService,
} from "./repository/message.repo";
let io: Server;

export const initSocketIO = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*", // hoặc domain FE
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected: ", socket.id);

    socket.on(
      "send-message",
      async ({
        senderId,
        patientId,
        doctorId,
        senderType,
        content,
        messageType,
      }) => {
        try {
          const conversation = await createConversationService(
            patientId,
            doctorId
          );
          const message = await createMessageService(
            conversation.id,
            senderId,
            senderType,
            content,
            messageType
          );

          socket.emit("message-sent", {
            id: message.id,
            conversationId: conversation.id,
            content: message.content,
            timestamp: new Date(message.createdAt).toLocaleTimeString(),
            isOwn: true,
            success: true,
          });
        } catch (error) {
          console.error("Error in send-message:", error);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

export const getIO = () => io;
