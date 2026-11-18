import express from "express";

import {
  sendDirectMessage,
  sendGroupMessage,
} from "../controllers/message.controller.js";
import {
  checkFriendship,
  checkGroupMembership,
} from "../middleware/friend.middleware.js";
import { uploadMessageMedia } from "../middleware/upload.middleware.js";

const router = express.Router();
router.post("/direct", uploadMessageMedia, checkFriendship, sendDirectMessage);
router.post("/group", uploadMessageMedia, checkGroupMembership, sendGroupMessage);
export default router;
