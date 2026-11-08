import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { Conversation } from "@/types/chat";

interface GroupMessageProps {
  conversation: Conversation;
  currentUserId: string;
}

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
  if (diffDays < 7) return WEEKDAYS[parsed.getDay()];

  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
};

export default function GroupMessage({
  conversation,
  currentUserId,
}: GroupMessageProps) {
  const router = useRouter();

  const groupName = conversation.group?.name ?? "Chat nhóm";
  const lastMessage = conversation.lastMessage;

  const senderId =
    typeof lastMessage?.senderId === "string"
      ? lastMessage.senderId
      : lastMessage?.senderId?._id;

  const sender = conversation.participants.find(
    (participant) => participant._id === senderId,
  );

  const isSentByMe = senderId === currentUserId;
  const unreadCount = conversation.unreadCounts?.[currentUserId] ?? 0;
  const hasUnread = unreadCount > 0;

  const messagePreview = lastMessage
    ? lastMessage.content?.trim() || "Đã gửi tin nhắn"
    : "Bắt đầu cuộc trò chuyện";

  const senderName = isSentByMe ? "Bạn" : (sender?.displayName ?? "Người dùng");

  const openConversation = () => {
    router.push({
      pathname: "/chat/[id]",
      params: {
        id: conversation._id,
        type: "group",
        name: groupName,
      },
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        hasUnread && styles.cardUnread,
        pressed && styles.cardPressed,
      ]}
      onPress={openConversation}
    >
      {hasUnread && <View style={styles.accentBar} />}

      {/* Hàng 1: avatar + tên nhóm + thời gian */}
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{groupName.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {groupName}
          </Text>
          <Text style={styles.memberCount}>
            {conversation.participants.length} thành viên
          </Text>
        </View>

        <Text style={styles.time}>{formatTime(lastMessage?.createdAt)}</Text>
      </View>

      {/* Hàng 2: tin nhắn cuối + badge */}
      <View style={styles.bottomRow}>
        <Text
          style={[styles.message, hasUnread && styles.unreadMessage]}
          numberOfLines={1}
        >
          {lastMessage ? `${senderName}: ` : ""}
          {messagePreview}
        </Text>

        {hasUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /* ---------- Khung card ---------- */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F5",
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 6,

    // shadow iOS
    shadowColor: "#1F1B4D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    // shadow Android
    elevation: 2,
  },

  cardUnread: {
    backgroundColor: "#FAF9FF",
    borderColor: "#E4DEFB",
  },

  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: "#F5F3FF",
  },

  accentBar: {
    position: "absolute",
    left: 0,
    top: 20,
    bottom: 20,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: "#6D5BD0",
  },

  /* ---------- Hàng 1 ---------- */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7C3AED",
  },

  headerInfo: {
    flex: 1,
    marginRight: 8,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  memberCount: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },

  time: {
    fontSize: 13,
    color: "#9CA3AF",
    alignSelf: "flex-start",
  },

  /* ---------- Hàng 2 ---------- */
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },

  message: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    marginRight: 8,
  },

  unreadMessage: {
    color: "#111827",
    fontWeight: "600",
  },

  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#6D5BD0",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  unreadText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
