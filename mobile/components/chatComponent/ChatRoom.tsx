import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#3B2FD0",
  primarySoft: "#EEEBFF",
  bg: "#F4F5FA",
  card: "#FFFFFF",
  text: "#1B1B2F",
  sub: "#6B7280",
  border: "#E5E7EB",
  online: "#22C55E",
};

export type ChatType = "direct" | "group";

type Message = {
  id: string;
  from: "me" | "other";
  senderName?: string;
  senderAvatar?: string;
  text?: string;
  time: string;
  seen?: boolean;
  reaction?: string;
  file?: { name: string; preview: string };
};

type Props = {
  type: ChatType;
  name: string;
  avatar?: string;
  memberCount?: number;
  onBack: () => void;
};

const AVATAR = "https://i.pravatar.cc/150?img=47";

const DIRECT_MESSAGES: Message[] = [
  {
    id: "1",
    from: "other",
    text: "Chào Minh Quân! Mình xem profile của bạn thấy dự án UI mới đỉnh quá 😍",
    time: "10:14",
  },
  {
    id: "2",
    from: "other",
    senderAvatar: AVATAR,
    text: "Bạn có rảnh trao đổi xíu về phần thiết kế hệ thống chat này không?",
    time: "10:15",
  },
  {
    id: "3",
    from: "me",
    text: "Chào Lan Anh! Cảm ơn bạn nhiều nhé, dự án này mình vừa hoàn thiện xong sáng nay.",
    time: "10:16",
    seen: true,
  },
  {
    id: "4",
    from: "me",
    text: "Đây là bản preview flow tương tác kết bạn và realtime chat nhé!",
    time: "10:17",
    seen: true,
    file: {
      name: "chat_design_system_preview.fig",
      preview: "https://picsum.photos/600/300",
    },
  },
  {
    id: "5",
    from: "other",
    senderAvatar: AVATAR,
    text: "Tuyệt vời quá! Mình gửi lời mời kết bạn liền luôn nè 🚀",
    time: "10:18",
    reaction: "❤️ 1",
  },
];

const GROUP_MESSAGES: Message[] = [
  {
    id: "1",
    from: "other",
    senderName: "Quốc Bảo",
    senderAvatar: "https://i.pravatar.cc/150?img=12",
    text: "Mọi người ơi, mai họp lúc mấy giờ nhỉ?",
    time: "09:30",
  },
  {
    id: "2",
    from: "other",
    senderName: "Thảo My",
    senderAvatar: "https://i.pravatar.cc/150?img=32",
    text: "9h sáng nhé, mình đã gửi lịch rồi 📅",
    time: "09:32",
  },
  {
    id: "3",
    from: "me",
    text: "Ok mình nhận được rồi, cảm ơn cả nhà!",
    time: "09:35",
    seen: true,
  },
];

export default function ChatRoom({
  type,
  name,
  avatar,
  memberCount = 0,
  onBack,
}: Props) {
  const isGroup = type === "group";
  const [messages, setMessages] = useState<Message[]>(
    isGroup ? GROUP_MESSAGES : DIRECT_MESSAGES,
  );
  const [text, setText] = useState("");
  const listRef = useRef<FlatList<Message>>(null);

  const send = () => {
    const value = text.trim();
    if (!value) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), from: "me", text: value, time },
    ]);
    setText("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const renderHeader = () => (
    <View>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={10}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <View style={styles.topTitleWrap}>
          <View style={styles.topIcon}>
            <Ionicons
              name="chatbubble-ellipses"
              size={16}
              color="#fff"
            />
          </View>
          <Text style={styles.topTitle}>
            {isGroup ? "Group Message" : "Direct Message"}
          </Text>
        </View>
        <Ionicons
          name="ellipsis-vertical"
          size={18}
          color={COLORS.text}
        />
      </View>

      {/* Contact header */}
      <View style={styles.contactRow}>
        <View>
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={styles.contactAvatar}
            />
          ) : (
            <View style={[styles.contactAvatar, styles.groupAvatar]}>
              <Ionicons
                name="people"
                size={24}
                color={COLORS.primary}
              />
            </View>
          )}
          {!isGroup && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.contactInfo}>
          <View style={styles.nameRow}>
            <Text
              style={styles.contactName}
              numberOfLines={1}
            >
              {name}
            </Text>
            {!isGroup && (
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.primary}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
          {isGroup ? (
            <Text style={styles.statusText}>{memberCount} thành viên</Text>
          ) : (
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={[styles.statusText, { color: COLORS.online }]}>
                Đang hoạt động
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {/* Nhóm: ẩn nút gọi điện / video */}
          {!isGroup && (
            <>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons
                  name="call-outline"
                  size={18}
                  color={COLORS.text}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons
                  name="videocam-outline"
                  size={20}
                  color={COLORS.text}
                />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dateWrap}>
        <Text style={styles.dateText}>Hôm nay, 24 Tháng 10</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Message }) => {
    const mine = item.from === "me";

    return (
      <View style={[styles.msgRow, mine && { justifyContent: "flex-end" }]}>
        {/* Avatar người gửi */}
        {!mine && (
          <View style={styles.msgAvatarSlot}>
            {item.senderAvatar && (
              <Image
                source={{ uri: item.senderAvatar }}
                style={styles.msgAvatar}
              />
            )}
          </View>
        )}

        <View style={{ maxWidth: "78%" }}>
          <View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleOther]}>
            {isGroup && !mine && item.senderName && (
              <Text style={styles.senderName}>{item.senderName}</Text>
            )}

            {item.file && (
              <View style={styles.fileCard}>
                <Image
                  source={{ uri: item.file.preview }}
                  style={styles.filePreview}
                />
                <View style={styles.fileNameBar}>
                  <Ionicons
                    name="image-outline"
                    size={14}
                    color="#fff"
                  />
                  <Text
                    style={styles.fileName}
                    numberOfLines={1}
                  >
                    {item.file.name}
                  </Text>
                </View>
              </View>
            )}

            {!!item.text && (
              <Text style={[styles.msgText, mine && styles.msgTextMe]}>
                {item.text}
              </Text>
            )}

            <View style={styles.metaRow}>
              {item.reaction ? (
                <View style={styles.reaction}>
                  <Text style={styles.reactionText}>{item.reaction}</Text>
                </View>
              ) : (
                <View />
              )}
              <View style={styles.timeRow}>
                <Text style={[styles.time, mine && { color: "#D6D3FF" }]}>
                  {item.time}
                </Text>
                {mine && (
                  <Ionicons
                    name={item.seen ? "checkmark-done" : "checkmark"}
                    size={14}
                    color="#9AD7FF"
                    style={{ marginLeft: 4 }}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => (
    <View style={styles.typingRow}>
      <Image
        source={{ uri: AVATAR }}
        style={styles.typingAvatar}
      />
      <View style={styles.typingPill}>
        <Text style={styles.typingText}>
          {isGroup ? "Quốc Bảo đang gõ" : `${name} đang gõ`}
        </Text>
        <Text style={styles.typingDots}> •••</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 12 }}
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity hitSlop={8}>
            <Ionicons
              name="attach"
              size={24}
              color={COLORS.sub}
            />
          </TouchableOpacity>
          <View style={styles.inputWrap}>
            <TouchableOpacity hitSlop={8}>
              <Ionicons
                name="happy-outline"
                size={22}
                color={COLORS.sub}
              />
            </TouchableOpacity>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={COLORS.sub}
              style={styles.input}
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <TouchableOpacity hitSlop={8}>
              <Ionicons
                name="camera-outline"
                size={22}
                color={COLORS.sub}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.micBtn}
            onPress={send}
          >
            <Ionicons
              name={text.trim() ? "send" : "mic"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  /* Top bar */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    height: 52,
    backgroundColor: COLORS.card,
  },
  topTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  topIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#7C6CF0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  topTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },

  /* Contact */
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactAvatar: { width: 44, height: 44, borderRadius: 22 },
  groupAvatar: {
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: "#fff",
  },
  contactInfo: { flex: 1, marginLeft: 10 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  contactName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    flexShrink: 1,
  },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.online,
    marginRight: 5,
  },
  statusText: { fontSize: 12, color: COLORS.sub, marginTop: 2 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  dateWrap: { alignItems: "center", marginVertical: 12 },
  dateText: {
    fontSize: 11,
    color: COLORS.sub,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },

  /* Messages */
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  msgAvatarSlot: { width: 28, marginRight: 6 },
  msgAvatar: { width: 24, height: 24, borderRadius: 12 },
  bubble: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  bubbleOther: { backgroundColor: COLORS.card },
  bubbleMe: { backgroundColor: COLORS.primary },
  senderName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 2,
  },
  msgText: { fontSize: 14, lineHeight: 20, color: COLORS.text },
  msgTextMe: { color: "#fff", fontWeight: "600" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    gap: 12,
  },
  timeRow: { flexDirection: "row", alignItems: "center" },
  time: { fontSize: 11, color: COLORS.sub },
  reaction: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  reactionText: { fontSize: 11, color: COLORS.text },

  /* File card */
  fileCard: { borderRadius: 10, overflow: "hidden", marginBottom: 8, width: 230 },
  filePreview: { width: "100%", height: 120, backgroundColor: "#ddd" },
  fileNameBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
  },
  fileName: { color: "#fff", fontSize: 12, flex: 1 },

  /* Typing */
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 4,
  },
  typingAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  typingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typingText: { fontSize: 12, color: COLORS.sub },
  typingDots: { fontSize: 12, color: COLORS.primary, fontWeight: "700" },

  /* Input */
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 12,
    backgroundColor: COLORS.bg,
    gap: 8,
  },
  input: { flex: 1, fontSize: 14, color: COLORS.text },
  micBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
