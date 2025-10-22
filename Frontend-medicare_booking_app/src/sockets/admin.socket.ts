import { io, Socket } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL;

export const connectAdminSocket = () => {
  const socketConnection = io(socketUrl, {
    transports: ["polling", "websocket"],
  });

  return socketConnection;
};

export const disconnectAdminSocket = (socket: Socket) => {
  if (socket) socket.disconnect();
};
