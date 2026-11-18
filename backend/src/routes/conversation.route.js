import express from "express";
import {
  createConversation,
  getConversations,
  getMessages,
  markAsSeen,
} from "../controllers/coversation.controller.js";
import upload from "../middleware/upload.middleware.js";
import { checkFriendship } from "../middleware/friend.middleware.js";

const router = express.Router();

// router.post("/", checkFriendship, createConversation);
router.post("/", upload.single("avatar"), createConversation);
router.get("/", getConversations);
router.get("/:conversationId/messages", getMessages);
router.patch("/:conversationId/seen", markAsSeen);

export default router;
