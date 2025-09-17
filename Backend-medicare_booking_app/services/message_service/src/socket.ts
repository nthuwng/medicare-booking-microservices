import { Server } from "socket.io";
import {
  createConversationService,
  createMessageService,
} from "./repository/message.repo";
import {
  getPatientByIdViaRabbitMQ,
  getDoctorByIdViaRabbitMQ,
} from "./queue/publishers/message.publisher";
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

    // Join message room by userId
    socket.on("join-message-room", ({ userId }) => {
      const userRoom = `user-${userId}`;
      socket.join(userRoom);
    });

    // Join conversation room
    socket.on("join-conversation", ({ conversationId }) => {
      const roomName = `conversation-${conversationId}`;
      socket.join(roomName);
    });

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

          // Auto join sender to conversation room
          socket.join(`conversation-${conversation.id}`);

          const message = await createMessageService(
            conversation.id,
            senderId,
            senderType,
            content,
            messageType
          );

          const messageData = {
            id: message.id,
            conversationId: conversation.id,
            content: message.content,
            timestamp: new Date(message.createdAt).toLocaleTimeString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }),
            senderId: message.senderId,
            success: true,
          };

          // Broadcast message to all users in conversation (including sender)
          const roomName = `conversation-${conversation.id}`;

          io.to(roomName).emit("message-sent", {
            ...messageData,
            // Frontend will determine isOwn based on senderId
          });

          // Cũng emit đến user rooms để đảm bảo nhận được tin nhắn
          io.to(`user-${senderId}`).emit("message-sent", messageData);

          // Lấy userId của patient và doctor để emit đến đúng user rooms
          try {
            if (senderType === "PATIENT") {
              // Patient gửi tin nhắn → emit đến doctor user room
              const doctorInfo = await getDoctorByIdViaRabbitMQ(doctorId);
              if (doctorInfo?.userId) {
                io.to(`user-${doctorInfo.userId}`).emit(
                  "message-sent",
                  messageData
                );
              }
            } else if (senderType === "DOCTOR") {
              // Doctor gửi tin nhắn → emit đến patient user room
              const patientInfo = await getPatientByIdViaRabbitMQ(patientId);
              if (patientInfo?.user_id) {
                io.to(`user-${patientInfo.user_id}`).emit(
                  "message-sent",
                  messageData
                );
              }
            }
          } catch (userLookupError) {
            console.error("❌ Lỗi khi lấy thông tin user:", userLookupError);
            // Fallback: vẫn emit đến conversation room
          }
        } catch (error) {
          console.error("❌ Error in send-message:", error);
          socket.emit("message-error", { error: "Failed to send message" });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

export const getIO = () => io;
