import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ENV } from "../config/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized - Token không tồn tại"));
    }

    const payload = jwt.verify(token, ENV.JWT_SECRET);

    if (!payload?.userId) {
      return next(new Error("Unauthorized - Token không hợp lệ hoặc đã hết hạn"));
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      return next(new Error("User chưa được đồng bộ vào MongoDB"));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error("Lỗi khi verify JWT token trong socketMiddleware:", error.message);
    next(new Error("Unauthorized"));
  }
};
