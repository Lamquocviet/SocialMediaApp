import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

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
