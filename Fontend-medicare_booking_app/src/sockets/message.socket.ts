import { io, Socket } from "socket.io-client";

const socketUrl = import.meta.env.VITE_MESSAGE_SOCKET_URL;

export const connectMessageSocket = () => {
  const socketConnection = io(socketUrl, {
    transports: ["polling", "websocket"],
  });

  return socketConnection;
};

export const disconnectMessageSocket = (socket: Socket) => {
  if (socket) socket.disconnect();
};
