import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import {
  emitNewMessage,
  updateConversationAfterCreateMessage,
} from "../utils/messageHelper.js";
import { io } from "../socket/index.js";
import {
  uploadImageFromBuffer,
  uploadAudioFromBuffer,
} from "../utils/uploadImage.js";

const uploadAttachments = async (req) => {
  const imageFile = req.files?.image?.[0];
  const audioFile = req.files?.audio?.[0];

  const [img, audio] = await Promise.all([
    imageFile ? uploadImageFromBuffer(imageFile.buffer) : null,
    audioFile ? uploadAudioFromBuffer(audioFile.buffer) : null,
  ]);

  const duration = Number(req.body.audioDuration);

  return {
    imgUrl: img?.secure_url,
    audioUrl: audio?.secure_url,
    audioDuration: audio && Number.isFinite(duration) ? duration : undefined,
  };
};

const hasAttachment = (req) =>
  !!(req.files?.image?.length || req.files?.audio?.length);

export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, conversationId } = req.body;
    const senderId = req.user._id;

    let conversation;

    if (!content && !hasAttachment(req)) {
      return res.status(400).json({ message: "Thiếu nội dung, ảnh hoặc audio" });
    }

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: recipientId, joinedAt: new Date() },
        ],
        lastMessageAt: new Date(),
        unreadCounts: new Map(),
      });
    }

    const attachments = await uploadAttachments(req);

    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
      ...attachments,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    emitNewMessage(io, conversation, message);

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xảy ra khi gửi tin nhắn trực tiếp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;

    if (!content && !hasAttachment(req)) {
      return res.status(400).json({ message: "Thiếu nội dung, ảnh hoặc audio" });
    }

    const attachments = await uploadAttachments(req);
    const message = await Message.create({
      conversationId,
      senderId,
      content,
      ...attachments,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();
    emitNewMessage(io, conversation, message);

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xảy ra khi gửi tin nhắn nhóm", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
