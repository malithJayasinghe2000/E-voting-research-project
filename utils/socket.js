import { Server } from "socket.io";

let io;

if (!global.io) {
  io = new Server(5000, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  global.io = io;
} else {
  io = global.io;
}

export { io };
