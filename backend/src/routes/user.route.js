import express from "express";
import {
  followUser,
  getCurrentUser,
  getUserProfile,
  searchUsers,
  syncUser,
  updateProfile,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// public route
router.get("/profile/:username", getUserProfile);

// protected routes
router.get("/search", protectRoute, searchUsers);
router.post("/sync", protectRoute, syncUser);
router.get("/me", protectRoute, getCurrentUser);

router.patch("/profile", protectRoute, upload.single("image"), updateProfile);
router.post("/follow/:targetUserId", protectRoute, followUser);

export default router;
