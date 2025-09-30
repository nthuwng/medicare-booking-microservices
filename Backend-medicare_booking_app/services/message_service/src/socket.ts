// src/socket.ts
import { Server } from "socket.io";
import {
  createConversationService, // MUST be idempotent (get-or-create by patientId+doctorId)
  createMessageService,
} from "./repository/message.repo";
import {
  getPatientByIdViaRabbitMQ,
  getDoctorByIdViaRabbitMQ,
} from "./queue/publishers/message.publisher";
import { MessageType } from "@prisma/client";

let io: Server;

export const initSocketIO = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // --- User-level room (để update sidebar/badge)
    socket.on("join-message-room", ({ userId }: { userId: string }) => {
      const room = `user-${userId}`;
      socket.join(room);
    });

    // --- Join/leave phòng hội thoại (để nhận nội dung message)
    socket.on(
      "join-conversation",
      ({ conversationId }: { conversationId: string | number }) => {
        socket.join(`conversation-${conversationId}`);
      }
    );

    socket.on(
      "leave-conversation",
      ({ conversationId }: { conversationId: string | number }) => {
        socket.leave(`conversation-${conversationId}`);
      }
    );

    // --- Gửi tin nhắn
    socket.on(
      "send-message",
      async ({
        senderId,
        patientId,
        doctorId,
        senderType, // "PATIENT" | "DOCTOR"
        content,
        messageType, // "TEXT" | ...
        // optional: conversationId (nếu FE có sẵn)
        conversationId,
      }: {
        senderId: string;
        patientId: string;
        doctorId: string;
        senderType: "PATIENT" | "DOCTOR";
        content: string;
        messageType: string;
        conversationId?: string | number;
      }) => {
        try {
          // Lấy/ tạo hội thoại 1-1 giữa patient-doctor
          const conversation = await createConversationService(
            patientId,
            doctorId
          );

          // (Optional) nếu client gửi conversationId khác -> vẫn dùng id từ server
          const convId = conversation.id;

          // Bảo đảm sender đang ở đúng phòng
          socket.join(`conversation-${convId}`);

          // Lưu message
          const message = await createMessageService(
            convId,
            senderId,
            senderType,
            content,
            messageType as MessageType
          );

          // Payload chung
          const messageData = {
            id: message.id,
            conversationId: convId,
            content: message.content,
            createdAt: message.createdAt,
            timestamp: new Date(message.createdAt).toLocaleTimeString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }),
            senderId: message.senderId,
            success: true,
          };

          // 1) Nội dung chat: CHỈ gửi vào phòng hội thoại
          io.to(`conversation-${convId}`).emit("message-sent", messageData);

          // 2) Cập nhật list hội thoại (preview/badge): gửi tới 2 user room
          const updatePayload = {
            conversationId: convId,
            lastMessage: message.content,
            createdAt: message.createdAt,
            senderId: message.senderId,
          };

          try {
            const [doctorInfo, patientInfo] = await Promise.all([
              getDoctorByIdViaRabbitMQ(doctorId),
              getPatientByIdViaRabbitMQ(patientId),
            ]);

            if (doctorInfo?.userId) {
              io.to(`user-${doctorInfo.userId}`).emit(
                "conversation-updated",
                updatePayload
              );
            }
            if (patientInfo?.user_id) {
              io.to(`user-${patientInfo.user_id}`).emit(
                "conversation-updated",
                updatePayload
              );
            }
          } catch (userLookupError) {
            console.error("User lookup error:", userLookupError);
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
