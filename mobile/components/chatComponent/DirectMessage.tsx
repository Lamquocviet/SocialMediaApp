import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type DirectConversation = {
  id: string;
  name: string;
  avatar: string;
  time: string;
  message: string;
  online?: boolean;
  unread?: number;
  sentByMe?: boolean;
  seen?: boolean;
  pinned?: boolean;
};

const DIRECT_MESSAGES: DirectConversation[] = [
  {
    id: "1",
    name: "Lan Anh Hoàng",
    avatar: "https://i.pravatar.cc/150?img=47",
    time: "10:18",
    message: "Tuyệt vời quá! Mình gửi lời mời kết bạn...",
    online: true,
    unread: 2,
    pinned: true,
  },
  {
    id: "2",
    name: "Lê Quốc Bảo",
    avatar: "https://i.pravatar.cc/150?img=12",
    time: "09:30",
    message: "Mọi người hẹn cà phê trao đổi nhé!",
    online: true,
    sentByMe: true,
    seen: true,
  },
  {
    id: "3",
    name: "Nguyễn Thảo My",
    avatar: "https://i.pravatar.cc/150?img=32",
    time: "Hôm qua",
    message: "Cảm ơn bạn nhiều nhé! ✨",
    sentByMe: true,
    seen: true,
  },
  {
    id: "4",
    name: "Tuấn Kiệt",
    avatar: "https://i.pravatar.cc/150?img=15",
    time: "T2",
    message: "Bạn đang làm dự án gì vậy?",
    online: false,
    unread: 1,
  },
];

const COLORS = {
  primary: "#5B4BDB",
  bg: "#F4F5FA",
  card: "#FFFFFF",
  text: "#1B1B2F",
  sub: "#6B7280",
  online: "#22C55E",
};

const DirectMessageItem = ({ item }: { item: DirectConversation }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/chat/[id]",
          params: {
            id: item.id,
            type: "direct",
            name: item.name,
            avatar: item.avatar,
          },
        })
      }
    >
      <View>
        <Image
          source={{ uri: item.avatar }}
          style={styles.avatar}
        />
        {item.online && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.nameWrap}>
            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.pinned && (
              <Ionicons
                name="pin"
                size={12}
                color={COLORS.primary}
              />
            )}
          </View>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.messageWrap}>
            {item.sentByMe && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color={COLORS.primary}
              />
            )}
            <Text
              numberOfLines={1}
              style={[styles.message, !!item.unread && styles.unreadMessage]}
            >
              {item.message}
            </Text>
          </View>

          {!!item.unread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread}</Text>
            </View>
          )}

          {!item.unread && item.seen && (
            <Ionicons
              name="checkmark"
              size={16}
              color={COLORS.online}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function DirectMessage() {
  if (DIRECT_MESSAGES.length === 0) {
    return <Text style={styles.empty}>Chưa có tin nhắn cá nhân</Text>;
  }

  return (
    <View style={styles.container}>
      {DIRECT_MESSAGES.map((item) => (
        <DirectMessageItem
          key={item.id}
          item={item}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10, // Khoảng cách giữa các item chat cá nhân
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginTop: 5,
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
  empty: {
    textAlign: "center",
    color: COLORS.sub,
    marginTop: 30,
  },
});
