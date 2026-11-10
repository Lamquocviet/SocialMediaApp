import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { Conversation } from "@/types/chat";

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isPinned?: boolean;
}

const PRIMARY = "#3B2FC9";
const AVATAR_ICON = "#3730A3"; // indigo-800
const SUB = "#6B7280"; // gray-500

const AVATAR_SIZE = 48;
const avatarStyle = {
  width: AVATAR_SIZE,
  height: AVATAR_SIZE,
  borderRadius: AVATAR_SIZE / 2,
  overflow: "hidden" as const,
  flexShrink: 0,
};

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatTime = (date?: string | null) => {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  const now = new Date();

  if (isSameDay(parsed, now)) {
    return parsed.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const diffDays = (now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays >= 0 && diffDays < 7) return WEEKDAYS[parsed.getDay()];

  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
};

export default function ConversationItem({
  conversation,
  currentUserId,
  isPinned = false,
}: ConversationItemProps) {
  const router = useRouter();

  const isGroup = conversation.type === "group";
  const normalizedCurrentUserId = String(currentUserId ?? "");

  const otherUser = isGroup
    ? undefined
    : conversation.participants.find(
        (participant) => String(participant._id) !== normalizedCurrentUserId,
      );

  const displayName = isGroup
    ? (conversation.group?.name ?? "Chat nhóm")
    : (otherUser?.displayName ?? "Người dùng");

  const avatarUrl = otherUser?.avatarUrl;

  const lastMessage = conversation.lastMessage;

  const senderId = lastMessage?.senderId?._id;

  const sender = conversation.participants.find(
    (participant) => participant._id === senderId,
  );

  const isSentByMe = String(senderId) === normalizedCurrentUserId;

  const unreadCount = conversation.unreadCounts?.[normalizedCurrentUserId] ?? 0;
  const hasUnread = unreadCount > 0;

  const messagePreview = lastMessage
    ? lastMessage.content?.trim() || "Đã gửi tin nhắn"
    : "Bắt đầu cuộc trò chuyện";

  const senderName = isSentByMe ? "Bạn" : (sender?.displayName ?? "Người dùng");

  const messagePrefix =
    lastMessage && isGroup
      ? `${senderName}: `
      : lastMessage && isSentByMe
        ? "Bạn: "
        : "";

  const time = formatTime(lastMessage?.createdAt);

  const openConversation = () => {
    router.push({
      pathname: "/chat/[id]",
      params: {
        id: conversation._id,
        type: conversation.type,
        name: displayName,
        avatar: avatarUrl ?? "",
        recipientId: isGroup ? undefined : otherUser?._id,
      },
    });
  };

  const bgClass = hasUnread ? "bg-[#EBE8FE]" : "bg-[#F4F2FF]";

  return (
    <Pressable
      onPress={openConversation}
      className={`mx-4 my-1.5 h-[104px] justify-center rounded-[18px] border-[1.5px] border-[#D6D1FA] px-[14px] py-3 shadow-md active:bg-[#E2DDFD] ${bgClass}`}
    >
      {/*  avatar | nội dung */}
      <View className="flex-row items-center">
        {/* Avatar */}
        {isGroup ? (
          <View
            style={avatarStyle}
            className="items-center justify-center bg-indigo-100"
          >
            <Ionicons
              name="people"
              size={26}
              color={AVATAR_ICON}
            />
          </View>
        ) : avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={avatarStyle}
          />
        ) : (
          <View
            style={avatarStyle}
            className="items-center justify-center bg-indigo-100"
          >
            <Text className="text-lg font-bold text-indigo-800">
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Nội dung */}
        <View className="ml-3 min-w-0 flex-1 justify-center">
          {/* Hàng 1: tên (+ ghim) + thời gian */}
          <View className="flex-row items-center justify-between">
            <View className="mr-2 flex-1 flex-row items-center">
              <Text
                className={`shrink font-bold text-gray-900 ${
                  isGroup ? "text-[17px]" : "text-[15px]"
                }`}
                numberOfLines={1}
              >
                {displayName}
              </Text>

              {isGroup && isPinned && (
                <Ionicons
                  name="pin"
                  size={14}
                  color={PRIMARY}
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>

            <Text className={`text-gray-500 ${isGroup ? "text-sm" : "text-xs"}`}>
              {time}
            </Text>
          </View>

          {/* tin nhắn cuối + badge */}
          <View className="mt-2 flex-row items-center justify-between">
            <Text
              numberOfLines={1}
              className={`mr-2 flex-1 ${isGroup ? "text-sm" : "text-[13px]"} ${
                hasUnread ? "font-bold text-gray-900" : "text-gray-500"
              }`}
            >
              {messagePrefix}
              {messagePreview}
            </Text>

            {hasUnread && (
              <View className="h-6 min-w-[24px] items-center justify-center rounded-xl bg-[#3B2FC9] px-1.5">
                <Text className="text-xs font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </View>

          {/*  số thành viên */}
          {isGroup && (
            <View className="mt-1 h-[18px] flex-row items-center gap-1.5">
              <Ionicons
                name="people-outline"
                size={14}
                color={SUB}
              />
              <Text className="text-xs text-gray-500">
                {conversation.participants.length} thành viên
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
