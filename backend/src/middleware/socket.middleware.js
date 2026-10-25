import { verifyToken } from "@clerk/backend";
import User from "../models/user.model.js";
import { ENV } from "../config/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized - Token không tồn tại"));
    }

    // Bước 1: Verify Clerk session token
    const result = await verifyToken(token, {
      secretKey: ENV.CLERK_SECRET_KEY,
    });
    // Tùy phiên bản @clerk/backend: trả về payload trực tiếp hoặc { data, errors }
    const payload = result?.data ?? result;

    if (!payload?.sub) {
      return next(new Error("Unauthorized - Token không hợp lệ hoặc đã hết hạn"));
    }

    // Bước 2: Tìm user trong MongoDB (sub chính là clerkId)
    const user = await User.findOne({ clerkId: payload.sub });

    if (!user) {
      return next(new Error("User chưa được đồng bộ vào MongoDB"));
    }

    // Bước 3: Gắn user vào socket
    socket.user = user;

    next();
  } catch (error) {
    console.error(
      "Lỗi khi verify Clerk token trong socketMiddleware:",
      error.message,
    );
    next(new Error("Unauthorized"));
  }
};
