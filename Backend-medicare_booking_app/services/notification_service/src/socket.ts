import { Server } from "socket.io";

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

    // Admin join vào phòng 'admins'
    socket.on("join-admin-room", () => {
      socket.join("admins");
    });

    socket.on("join-user-room", ({ userId }) => {
      if (userId) socket.join(`user:${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

export const getIO = () => io;
