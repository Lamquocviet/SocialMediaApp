import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type GroupConversation = {
  id: string;
  name: string;
  time: string;
  message: string;
  sender: string;
  members: number;
  unread?: number;
  pinned?: boolean;
};

const GROUP_MESSAGES: GroupConversation[] = [
  {
    id: "1",
    name: "Design System Team",
    time: "10:30",
    sender: "Tuấn Kiệt",
    message: "Đã update component mới",
    members: 12,
    unread: 5,
    pinned: true,
  },
  {
    id: "2",
    name: "Project Chat App",
    time: "09:45",
    sender: "Quốc Bảo",
    message: "Mọi người kiểm tra lại API nhé!",
    members: 8,
    unread: 3,
  },
  {
    id: "3",
    name: "Team Development",
    time: "Hôm qua",
    sender: "Bạn",
    message: "Mình đã hoàn thành phần Backend",
    members: 15,
  },
  {
    id: "4",
    name: "Friends Forever",
    time: "T2",
    sender: "Lan Anh",
    message: "Cuối tuần này đi chơi không?",
    members: 6,
    unread: 2,
  },
];

const COLORS = {
  primary: "#5B4BDB",
  primarySoft: "#EEEBFF",
  card: "#FFFFFF",
  text: "#1B1B2F",
  sub: "#6B7280",
};

const GroupMessageItem = ({ item }: { item: GroupConversation }) => {
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
            type: "group",
            name: item.name,
            memberCount: item.members.toString(),
          },
        })
      }
    >
      <View style={styles.avatar}>
        <Ionicons
          name="people"
          size={23}
          color={COLORS.primary}
        />
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
            <Text
              numberOfLines={1}
              style={[styles.message, !!item.unread && styles.unreadMessage]}
            >
              {item.sender}: {item.message}
            </Text>
          </View>

          {!!item.unread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread}</Text>
            </View>
          )}
        </View>

        <View style={styles.memberWrap}>
          <Ionicons
            name="people-outline"
            size={12}
            color={COLORS.sub}
          />
          <Text style={styles.memberText}>{item.members} thành viên</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function GroupMessage() {
  if (GROUP_MESSAGES.length === 0) {
    return <Text style={styles.empty}>Chưa có nhóm trò chuyện</Text>;
  }

  return (
    <View style={styles.container}>
      {GROUP_MESSAGES.map((item) => (
        <GroupMessageItem
          key={item.id}
          item={item}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10, // Khoảng cách giữa các item nhóm
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
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: 5,
    marginRight: 8,
  },
  message: {
    fontSize: 12,
    color: COLORS.sub,
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
  memberWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },
  memberText: {
    fontSize: 10,
    color: COLORS.sub,
  },
  empty: {
    textAlign: "center",
    color: COLORS.sub,
    marginTop: 30,
  },
});
