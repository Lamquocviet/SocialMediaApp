import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socket.middleware.js";
import { getUserConversationsForSocketIO } from "../controllers/coversation.controller.js";

export let io;

// userId -> Set(socketId), hỗ trợ nhiều thiết bị
const onlineUsers = new Map();

export const initSocket = (httpServer) => {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  // Xác thực JWT trước khi cho phép kết nối
  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    const user = socket.user;
    const userId = String(user._id);

    console.log(`${user.username} online với socket ${socket.id}`);

    // Một user có thể có nhiều socket
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    // Room riêng của user
    socket.join(userId);

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);

      if (sockets) {
        sockets.delete(socket.id);

        // Chỉ offline khi tất cả thiết bị đã ngắt kết nối
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }

      io.emit("online-users", Array.from(onlineUsers.keys()));

      console.log(`Socket disconnected: ${socket.id}`);
    });

    // Join sẵn mọi conversation của user
    try {
      const conversationIds = await getUserConversationsForSocketIO(userId);
      conversationIds.forEach((id) => socket.join(id.toString()));
    } catch (err) {
      console.error("Lỗi join conversations:", err);
    }

    // Thông báo danh sách user đang online
    io.emit("online-users", Array.from(onlineUsers.keys()));

    // Tham gia room conversation
    socket.on("join-conversation", async (conversationId) => {
      if (typeof conversationId !== "string" || !conversationId.trim()) return;
      const ids = await getUserConversationsForSocketIO(userId);
      if (ids.map(String).includes(conversationId)) socket.join(conversationId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO chưa được khởi tạo");
  }

  return io;
};
