import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socket.middleware.js";
// import { getUserConversationsForSocketIO } from "../controllers/conversation.controller.js";

let io;

// userId (string) -> Set<socketId>  (1 user có thể đăng nhập nhiều thiết bị)
const onlineUsers = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      // React Native không gửi Origin nên không bị CORS chặn;
      // dòng này chỉ cần nếu bạn có thêm bản web
      origin: "*",
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    const user = socket.user;
    const userId = user._id.toString();

    console.log(`${user.username} online với socket ${socket.id}`);

    // Lưu socket của user
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    io.emit("online-users", Array.from(onlineUsers.keys()));

    // Room riêng của user: dùng gửi notification, tin nhắn, v.v.
    socket.join(userId);

    // Khi làm chat, bật lại đoạn này:
    // const conversationIds = await getUserConversationsForSocketIO(userId);
    // conversationIds.forEach((id) => socket.join(id.toString()));

    socket.on("join-conversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        // Chỉ offline khi không còn thiết bị nào
        if (sockets.size === 0) onlineUsers.delete(userId);
      }
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO chưa được khởi tạo");
  return io;
};
