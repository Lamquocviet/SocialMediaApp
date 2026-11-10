import express from "express";

import {
  sendDirectMessage,
  sendGroupMessage,
} from "../controllers/message.controller.js";
import {
  checkFriendship,
  checkGroupMembership,
} from "../middleware/friend.middleware.js";

const router = express.Router();

router.post("/direct", checkFriendship, sendDirectMessage);
router.post("/group", checkGroupMembership, sendGroupMessage);

export default router;
