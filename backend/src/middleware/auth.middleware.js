import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ENV } from "../config/env.js";

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - access token is required",
      });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded.sub || decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized - user not found",
      });
    }

    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized - token expired" });
    }

    return res.status(401).json({ message: "Unauthorized - invalid token" });
  }
};
