import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import Friend from "../models/friend.model.js";
import FriendRequest from "../models/friendRequest.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) return res.status(404).json({ error: "User not found" });

  const updatedUser = await User.findByIdAndUpdate(user._id, req.body, {
    new: true,
  });

  if (!updatedUser) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ user: updatedUser });
});

export const syncUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  return res.status(200).json({ user, message: "User synced successfully" });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ user });
});

export const followUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  const { targetUserId } = req.params;

  if (!currentUser) return res.status(401).json({ error: "Unauthorized" });
  if (currentUser._id.toString() === targetUserId)
    return res.status(400).json({ error: "You cannot follow yourself" });

  const targetUser = await User.findById(targetUserId);

  if (!targetUser) return res.status(404).json({ error: "User not found" });

  const isFollowing = currentUser.following.includes(targetUserId);

  if (isFollowing) {
    // unfollow
    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUser._id },
    });
  } else {
    // follow
    await User.findByIdAndUpdate(currentUser._id, {
      $push: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $push: { followers: currentUser._id },
    });

    // create notification
    await Notification.create({
      from: currentUser._id,
      to: targetUserId,
      type: "follow",
    });
  }

  res.status(200).json({
    message: isFollowing
      ? "User unfollowed successfully"
      : "User followed successfully",
  });
});

export const searchUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const q = req.query.q?.trim();

    if (!q) {
      return res.status(400).json({
        message: "Vui lòng nhập từ khóa tìm kiếm",
      });
    }

    const keyword = new RegExp(escapeRegex(q), "i");

    // 1. Tìm người dùng, loại trừ tài khoản hiện tại
    const users = await User.find({
      _id: { $ne: userId },
      $or: [{ username: keyword }, { displayName: keyword }],
    })
      .select("_id username displayName avatarUrl")
      .limit(20)
      .lean();

    if (!users.length) {
      return res.status(200).json({
        success: true,
        data: [],
        total: 0,
      });
    }

    const userIds = users.map((user) => user._id);

    // 2. Tìm những người đã là bạn bè
    const friendships = await Friend.find({
      $or: [
        {
          userA: userId,
          userB: { $in: userIds },
        },
        {
          userB: userId,
          userA: { $in: userIds },
        },
      ],
    })
      .select("userA userB")
      .lean();

    // 3. Tìm lời mời đã gửi và đã nhận
    const requests = await FriendRequest.find({
      $or: [
        {
          from: userId,
          to: { $in: userIds },
        },
        {
          to: userId,
          from: { $in: userIds },
        },
      ],
    })
      .select("_id from to")
      .lean();

    // 4. Tạo Map để tra cứu trạng thái nhanh
    const friendIds = new Set(
      friendships.map((friend) => {
        return friend.userA.toString() === userId.toString()
          ? friend.userB.toString()
          : friend.userA.toString();
      }),
    );

    const requestMap = new Map();

    requests.forEach((request) => {
      const isSent = request.from.toString() === userId.toString();

      const targetId = isSent ? request.to.toString() : request.from.toString();

      requestMap.set(targetId, {
        status: isSent ? "request_sent" : "request_received",
        requestId: request._id,
      });
    });

    // 5. Gắn trạng thái quan hệ vào từng User
    const results = users.map((user) => {
      const id = user._id.toString();

      let friendshipStatus = "not_friends";
      let requestId = null;

      if (friendIds.has(id)) {
        friendshipStatus = "friends";
      } else if (requestMap.has(id)) {
        const request = requestMap.get(id);
        friendshipStatus = request.status;
        requestId = request.requestId;
      }

      return {
        ...user,
        friendshipStatus,
        requestId,
      };
    });

    return res.status(200).json({
      success: true,
      data: results,
      total: results.length,
    });
  } catch (error) {
    console.error("Lỗi tìm kiếm người dùng:", error);

    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};
