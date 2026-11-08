import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { Conversation } from "@/types/chat";

interface DirectMessageProps {
  conversation: Conversation;
  currentUserId: string;
}
const COLORS = {
  primary: "#5B4BDB",
  bg: "#F4F5FA",
  card: "#FFFFFF",
  text: "#1B1B2F",
  sub: "#6B7280",
  online: "#22C55E",
};

const formatTime = (date?: string | null) => {
  if (!date) return "";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function DirectMessage({
  conversation,
  currentUserId,
}: DirectMessageProps) {
  const router = useRouter();

  const otherUser = conversation.participants.find(
    (participant) => participant._id !== currentUserId,
  );

  const lastMessage = conversation.lastMessage;

  const senderId =
    typeof lastMessage?.senderId === "string"
      ? lastMessage.senderId
      : lastMessage?.senderId?._id;

  const isSentByMe = senderId === currentUserId;

  const unreadCount = conversation.unreadCounts?.[currentUserId] ?? 0;

  const messagePreview = lastMessage
    ? lastMessage.content?.trim() || "Đã gửi tin nhắn"
    : "Bắt đầu cuộc trò chuyện";

  const displayName = otherUser?.displayName ?? "Người dùng";
  const avatarUrl = otherUser?.avatarUrl;

  // Các thuộc tính bổ trợ giao diện (fallback an toàn nếu dữ liệu backend chưa có)
  const isOnline = (otherUser as any)?.isOnline ?? false;
  const isPinned = (conversation as any)?.isPinned ?? false;

  const openConversation = () => {
    router.push({
      pathname: "/chat/[id]",
      params: {
        id: conversation._id,
        type: "direct",
        name: displayName,
        avatar: avatarUrl ?? "",
      },
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={openConversation}
    >
      {/* Avatar & Online Status Dot */}
      <View>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Top Row: Name, Pinned icon & Time */}
        <View style={styles.row}>
          <View style={styles.nameWrap}>
            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {isPinned && (
              <Ionicons
                name="pin"
                size={12}
                color={COLORS.primary}
              />
            )}
          </View>
          <Text style={styles.time}>{formatTime(lastMessage?.createdAt)}</Text>
        </View>

        {/* Bottom Row: Message preview, Sent checkmark & Unread Badge */}
        <View style={styles.row}>
          <View style={styles.messageWrap}>
            {isSentByMe && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color={COLORS.primary}
              />
            )}
            <Text
              numberOfLines={1}
              style={[styles.message, unreadCount > 0 && styles.unreadMessage]}
            >
              {lastMessage && isSentByMe ? "Bạn: " : ""}
              {messagePreview}
            </Text>
          </View>

          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          ) : (
            isSentByMe && (
              <Ionicons
                name="checkmark"
                size={16}
                color={COLORS.online}
              />
            )
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.85,
    backgroundColor: "#FAFAFC",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    flexShrink: 1,
  },
  time: {
    fontSize: 11,
    color: COLORS.sub,
  },
  messageWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    marginRight: 8,
  },
  message: {
    fontSize: 12,
    color: COLORS.sub,
    flexShrink: 1,
  },
  unreadMessage: {
    color: COLORS.text,
    fontWeight: "600",
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});
