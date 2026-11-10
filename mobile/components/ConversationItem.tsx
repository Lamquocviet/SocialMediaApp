import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import type { Conversation } from "@/types/chat";

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isPinned?: boolean;
}

const COLORS = {
  primary: "#5B4BDB",
  primarySoft: "#EFEBFE",
  text: "#1B1B2F",
  sub: "#9CA3AF",
};

type GradientColors = readonly [string, string, ...string[]];

// Gradient ánh tím cho từng trạng thái
const GRADIENTS: Record<"normal" | "unread" | "pressed", GradientColors> = {
  normal: ["#FFFFFF", "#F6F3FF", "#EDE7FF"],
  unread: ["#FFFFFF", "#EFE9FF", "#DFD4FF"],
  pressed: ["#F8F6FF", "#EAE3FF", "#DCD1FF"],
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

  const radius = isGroup ? 28 : 22;

  return (
    // Pressable: chỉ giữ bóng tím + bo góc (không overflow hidden để bóng hiện)
    <Pressable
      onPress={openConversation}
      style={[
        styles.shadow,
        { borderRadius: radius },
        hasUnread && styles.shadowUnread,
      ]}
    >
      {({ pressed }) => (
        // LinearGradient: nền gradient + viền tím mảnh
        <LinearGradient
          colors={
            pressed
              ? GRADIENTS.pressed
              : hasUnread
                ? GRADIENTS.unread
                : GRADIENTS.normal
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            styles.card,
            { borderRadius: radius },
            hasUnread && styles.gradientUnread,
          ]}
        >
          {/* Bố cục hàng ngang: avatar | nội dung */}
          <View style={styles.row}>
            {/* Avatar */}
            {isGroup ? (
              <View style={styles.groupAvatar}>
                <Ionicons
                  name="people"
                  size={30}
                  color={COLORS.primary}
                />
              </View>
            ) : avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.directAvatar}
              />
            ) : (
              <View style={[styles.directAvatar, styles.directAvatarFallback]}>
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {/* Nội dung */}
            <View style={styles.content}>
              {/* Hàng 1: tên (+ ghim) + thời gian */}
              <View style={styles.headerRow}>
                <View style={styles.nameWrap}>
                  <Text
                    style={[
                      styles.name,
                      isGroup ? styles.nameGroup : styles.nameDirect,
                    ]}
                    numberOfLines={1}
                  >
                    {displayName}
                  </Text>

                  {isGroup && isPinned && (
                    <Ionicons
                      name="pin"
                      size={14}
                      color={COLORS.primary}
                      style={styles.pin}
                    />
                  )}
                </View>

                <Text style={[styles.time, isGroup && styles.timeGroup]}>
                  {time}
                </Text>
              </View>

              {/* Hàng 2: tin nhắn cuối + badge */}
              <View style={styles.messageRow}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.message,
                    isGroup ? styles.messageGroup : styles.messageDirect,
                    hasUnread && styles.messageUnread,
                  ]}
                >
                  {messagePrefix}
                  {messagePreview}
                </Text>

                {hasUnread && (
                  <LinearGradient
                    colors={["#8B7BFF", "#5B4BDB"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.badge}
                  >
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </LinearGradient>
                )}
              </View>

              {/* Hàng 3 (chỉ nhóm): số thành viên */}
              {isGroup && (
                <View style={styles.memberRow}>
                  {isGroup ? (
                    <>
                      <Ionicons
                        name="people-outline"
                        size={14}
                        color={COLORS.sub}
                      />
                      <Text style={styles.memberCount}>
                        {conversation.participants.length} thành viên
                      </Text>
                    </>
                  ) : null}
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /* ---------- Bóng ánh tím (Pressable) ---------- */
  shadow: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: "#FFFFFF", // nền đệm để iOS vẽ bóng đúng
    shadowColor: "#7C5CFC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },

  shadowUnread: {
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 6,
  },

  /* ---------- Nền gradient ---------- */
  gradient: {
    borderWidth: 1,
    borderColor: "rgba(124, 92, 252, 0.14)",
    overflow: "hidden",
  },

  gradientUnread: {
    borderColor: "rgba(124, 92, 252, 0.32)",
  },

  card: {
    height: 104,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },

  /* ---------- Bố cục hàng ngang ---------- */
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  /* ---------- Avatar ---------- */
  groupAvatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },

  directAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  directAvatarFallback: {
    backgroundColor: "rgba(255,255,255,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.primary,
  },

  /* ---------- Nội dung ---------- */
  content: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  nameWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },

  name: {
    fontWeight: "700",
    color: COLORS.text,
    flexShrink: 1,
  },

  nameGroup: {
    fontSize: 17,
  },

  nameDirect: {
    fontSize: 15,
  },

  pin: {
    marginLeft: 8,
  },

  time: {
    fontSize: 12,
    color: COLORS.sub,
  },

  timeGroup: {
    fontSize: 14,
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },

  message: {
    flex: 1,
    fontSize: 13,
    color: "#8B8FA3",
    marginRight: 8,
  },

  messageGroup: {
    fontSize: 14,
  },

  messageDirect: {
    fontSize: 13,
  },

  messageUnread: {
    color: COLORS.text,
    fontWeight: "700",
  },

  memberRow: {
    height: 18,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },

  memberCount: {
    fontSize: 12,
    color: COLORS.sub,
  },

  /* ---------- Badge (gradient tím) ---------- */
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
