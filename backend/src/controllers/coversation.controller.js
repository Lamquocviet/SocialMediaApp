import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { io } from "../socket/index.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
import Friend from "../models/friend.model.js";

const uploadGroupAvatar = (file) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "group_avatars" }, (err, result) =>
        err ? reject(err) : resolve(result),
      )
      .end(file.buffer);
  });

// multipart gửi memberIds dạng chuỗi JSON, request JSON gửi mảng
const parseMemberIds = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [raw];
    } catch {
      return [raw];
    }
  }
  return [];
};
export const createConversation = async (req, res) => {
  try {
    const { type } = req.body;
    const name = req.body.name?.trim();
    const userId = req.user._id;
    const userIdStr = String(userId);

    const memberIds = [
      ...new Set(parseMemberIds(req.body.memberIds).map(String)),
    ].filter((id) => id !== userIdStr);

    if (!["direct", "group"].includes(type)) {
      return res.status(400).json({ message: "Conversation type không hợp lệ" });
    }

    if (memberIds.length === 0 || !memberIds.every(mongoose.isValidObjectId)) {
      return res.status(400).json({ message: "Danh sách thành viên không hợp lệ" });
    }

    let conversation;
    let isNew = false;

    if (type === "direct") {
      const participantId = memberIds[0];

      conversation = await Conversation.findOne({
        type: "direct",
        "participants.userId": { $all: [userId, participantId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          type: "direct",
          participants: [{ userId }, { userId: participantId }],
          lastMessageAt: new Date(),
        });
        isNew = true;
      }
    }

    if (type === "group") {
      if (!name) {
        return res.status(400).json({ message: "Tên nhóm là bắt buộc" });
      }
      if (name.length > 50) {
        return res.status(400).json({ message: "Tên nhóm tối đa 50 ký tự" });
      }
      if (memberIds.length < 2) {
        return res.status(400).json({ message: "Nhóm cần ít nhất 3 thành viên" });
      }

      // Chỉ cho thêm bạn bè vào nhóm
      const friendCount = await Friend.countDocuments({
        $or: [
          { userA: userId, userB: { $in: memberIds } },
          { userA: { $in: memberIds }, userB: userId },
        ],
      });

      if (friendCount !== memberIds.length) {
        return res.status(403).json({ message: "Chỉ có thể thêm bạn bè vào nhóm" });
      }

      let avatarUrl = "";
      let avatarId = "";

      if (req.file) {
        const uploaded = await uploadGroupAvatar(req.file);
        avatarUrl = uploaded.secure_url;
        avatarId = uploaded.public_id;
      }

      conversation = await Conversation.create({
        type: "group",
        participants: [
          { userId, role: "owner" },
          ...memberIds.map((id) => ({ userId: id })),
        ],
        group: { name, avatarUrl, avatarId, createdBy: userId },
        lastMessageAt: new Date(),
      });
      isNew = true;
    }

    await conversation.populate([
      { path: "participants.userId", select: "displayName profilePicture" },
      { path: "seenBy", select: "displayName profilePicture" },
      { path: "lastMessage.senderId", select: "displayName profilePicture" },
    ]);

    const participants = conversation.participants.map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      profilePicture: p.userId?.profilePicture ?? null,
      role: p.role,
      joinedAt: p.joinedAt,
    }));

    const formatted = { ...conversation.toObject(), participants };

    // Chỉ báo realtime khi thật sự tạo mới
    if (isNew) {
      participants.forEach((p) => {
        io.to(String(p._id)).emit("new-group", formatted);
      });
    }

    return res.status(isNew ? 201 : 200).json({ conversation: formatted });
  } catch (error) {
    console.error("Lỗi khi tạo conversation", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// export const createConversation = async (req, res) => {
//   try {
//     const { type, name, memberIds } = req.body;
//     const userId = req.user._id;

//     if (
//       !type ||
//       (type === "group" && !name) ||
//       !memberIds ||
//       !Array.isArray(memberIds) ||
//       memberIds.length === 0
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Tên nhóm và danh sách thành viên là bắt buộc" });
//     }

//     let conversation;

//     if (type === "direct") {
//       const participantId = memberIds[0];

//       conversation = await Conversation.findOne({
//         type: "direct",
//         "participants.userId": { $all: [userId, participantId] },
//       });

//       if (!conversation) {
//         conversation = new Conversation({
//           type: "direct",
//           participants: [{ userId }, { userId: participantId }],
//           lastMessageAt: new Date(),
//         });

//         await conversation.save();
//       }
//     }

//     if (type === "group") {
//       conversation = new Conversation({
//         type: "group",
//         participants: [{ userId }, ...memberIds.map((id) => ({ userId: id }))],
//         group: {
//           name,
//           createdBy: userId,
//         },
//         lastMessageAt: new Date(),
//       });

//       await conversation.save();
//     }

//     if (!conversation) {
//       return res.status(400).json({ message: "Conversation type không hợp lệ" });
//     }

//     await conversation.populate([
//       { path: "participants.userId", select: "displayName profilePicture" },
//       {
//         path: "seenBy",
//         select: "displayName profilePicture",
//       },
//       { path: "lastMessage.senderId", select: "displayName profilePicture" },
//     ]);

//     const participants = (conversation.participants || []).map((p) => ({
//       _id: p.userId?._id,
//       displayName: p.userId?.displayName,
//       profilePicture: p.userId?.profilePicture ?? null,
//       joinedAt: p.joinedAt,
//     }));

//     const formatted = { ...conversation.toObject(), participants };

//     if (type === "group") {
//       memberIds.forEach((userId) => {
//         io.to(userId).emit("new-group", formatted);
//       });
//     }

//     if (type === "direct") {
//       io.to(userId).emit("new-group", formatted);
//       io.to(memberIds[0]).emit("new-group", formatted);
//     }

//     return res.status(201).json({ conversation: formatted });
//   } catch (error) {
//     console.error("Lỗi khi tạo conversation", error);
//     return res.status(500).json({ message: "Lỗi hệ thống" });
//   }
// };

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      "participants.userId": userId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate({
        path: "participants.userId",
        select: "displayName profilePicture",
      })
      .populate({
        path: "lastMessage.senderId",
        select: "displayName profilePicture",
      })
      .populate({
        path: "seenBy",
        select: "displayName profilePicture",
      });

    const formatted = conversations.map((convo) => {
      const participants = (convo.participants || []).map((p) => ({
        _id: p.userId?._id,
        displayName: p.userId?.displayName,
        profilePicture: p.userId?.profilePicture ?? null,
        joinedAt: p.joinedAt,
      }));

      return {
        ...convo.toObject(),
        unreadCounts: convo.unreadCounts || {},
        participants,
      };
    });

    return res.status(200).json({ conversations: formatted });
  } catch (error) {
    console.error("Lỗi xảy ra khi lấy conversations", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query;

    const query = { conversationId };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1);

    let nextCursor = null;

    if (messages.length > Number(limit)) {
      const nextMessage = messages[messages.length - 1];
      nextCursor = nextMessage.createdAt.toISOString();
      messages.pop();
    }

    messages = messages.reverse();

    return res.status(200).json({
      messages,
      nextCursor,
    });
  } catch (error) {
    console.error("Lỗi xảy ra khi lấy messages", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getUserConversationsForSocketIO = async (userId) => {
  try {
    const conversations = await Conversation.find(
      { "participants.userId": userId },
      { _id: 1 },
    );

    return conversations.map((c) => c._id.toString());
  } catch (error) {
    console.error("Lỗi khi fetch conversations: ", error);
    return [];
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId).lean();

    if (!conversation) {
      return res.status(404).json({ message: "Conversation không tồn tại" });
    }

    const last = conversation.lastMessage;

    if (!last) {
      return res.status(200).json({ message: "Không có tin nhắn để mark as seen" });
    }

    if (last.senderId.toString() === userId) {
      return res.status(200).json({ message: "Sender không cần mark as seen" });
    }

    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: { seenBy: userId },
        $set: { [`unreadCounts.${userId}`]: 0 },
      },
      {
        new: true,
      },
    );

    io.to(conversationId).emit("read-message", {
      conversation: updated,
      lastMessage: {
        _id: updated?.lastMessage._id,
        content: updated?.lastMessage.content,
        createdAt: updated?.lastMessage.createdAt,
        sender: {
          _id: updated?.lastMessage.senderId,
        },
      },
    });

    return res.status(200).json({
      message: "Marked as seen",
      seenBy: updated?.sennBy || [],
      myUnreadCount: updated?.unreadCounts[userId] || 0,
    });
  } catch (error) {
    console.error("Lỗi khi mark as seen", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
