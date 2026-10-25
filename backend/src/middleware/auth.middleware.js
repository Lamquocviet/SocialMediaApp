import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    console.log("Auth debug:", {
      isAuthenticated,
      userId,
      path: req.originalUrl,
    });

    // Bước 1: Kiểm tra đăng nhập bằng Clerk
    if (!isAuthenticated || !userId) {
      return res.status(401).json({
        message: "Unauthorized - you must be logged in",
      });
    }

    // Bước 2: Tìm user trong MongoDB
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({
        message: "User chưa được đồng bộ vào MongoDB",
      });
    }

    // Bước 3: Gắn user MongoDB vào request
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
