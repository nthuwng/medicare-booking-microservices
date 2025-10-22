import { io, Socket } from "socket.io-client";

const socketUrl = import.meta.env.VITE_MESSAGE_SOCKET_URL;

export const connectMessageSocket = () => {
  const socketConnection = io(socketUrl, {
    transports: ["polling", "websocket"],
  });

  return socketConnection;
};

export const joinUserRoom = (socket: Socket, userId?: string) => {
  if (!socket || !userId) return;
  socket.emit("join-message-room", userId);
};

export const joinConversationRoom = (
  socket: Socket,
  conversationId: number,
  userId?: string
) => {
  if (!socket) return;
  socket.emit("conversation:join", { conversationId, userId });
};

export const sendMessage = (
  socket: Socket,
  payload: {
    conversationId?: number;
    patientId?: string;
    doctorId?: string;
    senderId: string;
    senderType: "PATIENT" | "DOCTOR";
    content: string;
    messageType?: "TEXT" | "IMAGE" | "FILE";
  }
): Promise<{
  ok: boolean;
  error?: string;
  conversationId?: number;
  messageId?: number;
}> => {
  return new Promise((resolve) => {
    socket.emit("message:send", payload, (ack: any) => resolve(ack));
  });
};

// NEW: lắng nghe message mới trong phòng hội thoại
export const onMessageNew = (socket: Socket, cb: (msg: any) => void) => {
  socket.on("message:new", cb);
};
export const offMessageNew = (socket: Socket, cb?: (msg: any) => void) => {
  cb ? socket.off("message:new", cb) : socket.off("message:new");
};

export const onConversationUpdated = (
  socket: Socket,
  cb: (data: any) => void
) => {
  socket.on("conversation:updated", cb);
};

export const offConversationUpdated = (
  socket: Socket,
  cb: (data: any) => void
) => {
  socket.off("conversation:updated", cb);
};

export const disconnectMessageSocket = (socket: Socket) => {
  if (socket) socket.disconnect();
};
