import React, { useMemo, useRef, useState } from "react";
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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useCallback, useEffect } from "react";

import {
  useConversations,
  useMessages,
  useSendDirectMessage,
  useSendGroupMessage,
  useMarkAsSeen,
} from "@/hooks/useChat";
import { useMe } from "@/hooks/useMe";
import type { Message } from "@/types/chat";

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

// type Message = {
//   id: string;
//   from: "me" | "other";
//   senderName?: string;
//   senderAvatar?: string;
//   text?: string;
//   time: string;
//   seen?: boolean;
//   reaction?: string;
//   file?: { name: string; preview: string };
// };

type Props = {
  conversationId?: string;
  recipientId?: string;
  fallbackType?: ChatType;
  fallbackName?: string;
  fallbackAvatar?: string;
  onBack: () => void;
  onConversationCreated?: (id: string) => void;
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

function Avatar({ uri, size }: { uri?: string | null; size: number }) {
  const s = { width: size, height: size, borderRadius: size / 2 };
  if (uri)
    return (
      <Image
        source={{ uri }}
        style={s}
      />
    );
  return (
    <View style={[s, styles.avatarPlaceholder]}>
      <Ionicons
        name="person"
        size={size * 0.55}
        color={COLORS.primary}
      />
    </View>
  );
}

export default function ChatRoom({
  conversationId,
  recipientId,
  fallbackType = "direct",
  fallbackName,
  fallbackAvatar,
  onBack,
  onConversationCreated,
}: Props) {
  const [text, setText] = useState("");

  const { data: me } = useMe();
  const { data: convData } = useConversations();

  const conversation = useMemo(
    () => convData?.conversations.find((c) => c._id === conversationId),
    [convData, conversationId],
  );

  const isGroup = (conversation?.type ?? fallbackType) === "group";

  // Thông tin header
  const other = conversation?.participants.find((p) => p._id !== me?._id);
  const title = isGroup
    ? (conversation?.group?.name ?? fallbackName ?? "Nhóm")
    : (other?.displayName ?? fallbackName ?? "Người dùng");
  const headerAvatar = isGroup ? null : (other?.avatarUrl ?? fallbackAvatar ?? null);
  const memberCount = conversation?.participants.length ?? 0;

  const participantMap = useMemo(
    () => new Map((conversation?.participants ?? []).map((p) => [p._id, p])),
    [conversation],
  );

  // Messages: pages[0] là trang mới nhất, mỗi trang sort tăng dần -> đảo để mới nhất đứng đầu (list inverted)
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessages(conversationId ?? "");

  const messages = useMemo(
    () => data?.pages.flatMap((p) => [...p.messages].reverse()) ?? [],
    [data],
  );

  const sendDirect = useSendDirectMessage();
  const sendGroup = useSendGroupMessage();
  const { mutate: markAsSeen } = useMarkAsSeen();
  const sending = sendDirect.isPending || sendGroup.isPending;

  // Đánh dấu đã xem khi còn tin chưa đọc
  const unread = me?._id ? (conversation?.unreadCounts?.[me._id] ?? 0) : 0;
  useEffect(() => {
    if (conversationId && unread > 0) markAsSeen(conversationId);
  }, [conversationId, unread]); // eslint-disable-line

  // Người còn lại đã xem tin cuối của mình chưa
  const seenByOthers = !!conversation?.seenBy?.some((u) => u._id !== me?._id);
  const lastMessageId = conversation?.lastMessage?._id;

  const send = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setText("");
    try {
      if (isGroup) {
        await sendGroup.mutateAsync({
          conversationId: conversationId!,
          content: value,
        });
      } else {
        const msg = await sendDirect.mutateAsync({
          conversationId,
          recipientId,
          content: value,
        });
        if (!conversationId && msg?.conversationId) {
          onConversationCreated?.(String(msg.conversationId));
        }
      }
    } catch {
      setText(value);
    }
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const mine = item.senderId === me?._id;
      const sender = participantMap.get(item.senderId);

      // list inverted: index + 1 = tin cũ hơn, index - 1 = tin mới hơn
      const older = messages[index + 1];
      const newer = messages[index - 1];
      const firstOfCluster = older?.senderId !== item.senderId;
      const lastOfCluster = newer?.senderId !== item.senderId;

      return (
        <View
          style={[
            styles.msgRow,
            mine && { justifyContent: "flex-end" },
            !lastOfCluster && { marginBottom: 3 },
          ]}
        >
          {!mine && (
            <View style={styles.msgAvatarSlot}>
              {lastOfCluster && (
                <Avatar
                  uri={sender?.avatarUrl}
                  size={24}
                />
              )}
            </View>
          )}

          <View style={{ maxWidth: "78%" }}>
            <View
              style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleOther]}
            >
              {isGroup && !mine && firstOfCluster && !!sender?.displayName && (
                <Text style={styles.senderName}>{sender.displayName}</Text>
              )}

              {!!item.imgUrl && (
                <Image
                  source={{ uri: item.imgUrl }}
                  style={[
                    styles.filePreview,
                    { width: 230, borderRadius: 10, marginBottom: 6 },
                  ]}
                />
              )}

              {!!item.content && (
                <Text style={[styles.msgText, mine && styles.msgTextMe]}>
                  {item.content}
                </Text>
              )}

              <View style={[styles.metaRow, { justifyContent: "flex-end" }]}>
                <Text style={[styles.time, mine && { color: "#D6D3FF" }]}>
                  {formatTime(item.createdAt)}
                </Text>
                {mine && item._id === lastMessageId && (
                  <Ionicons
                    name={seenByOthers ? "checkmark-done" : "checkmark"}
                    size={14}
                    color="#9AD7FF"
                    style={{ marginLeft: 4 }}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      );
    },
    [messages, me?._id, participantMap, isGroup, lastMessageId, seenByOthers],
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
    >
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

      {/* Contact row */}
      <View style={styles.contactRow}>
        {isGroup ? (
          <View style={[styles.contactAvatar, styles.groupAvatar]}>
            <Ionicons
              name="people"
              size={24}
              color={COLORS.primary}
            />
          </View>
        ) : (
          <Avatar
            uri={headerAvatar}
            size={44}
          />
        )}
        <View style={styles.contactInfo}>
          <Text
            style={styles.contactName}
            numberOfLines={1}
          >
            {title}
          </Text>
          {isGroup && (
            <Text style={styles.statusText}>{memberCount} thành viên</Text>
          )}
        </View>
        <View style={styles.actions}>
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {isLoading && !!conversationId ? (
          <ActivityIndicator
            style={{ flex: 1 }}
            color={COLORS.primary}
          />
        ) : (
          <FlatList
            data={messages}
            inverted
            keyExtractor={(m) => m._id}
            renderItem={renderItem}
            onEndReached={() =>
              hasNextPage && !isFetchingNextPage && fetchNextPage()
            }
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : null
            }
            ListEmptyComponent={
              !isLoading ? (
                <Text
                  style={{
                    textAlign: "center",
                    color: COLORS.sub,
                    transform: [{ scaleY: -1 }],
                  }}
                >
                  Hãy bắt đầu cuộc trò chuyện 👋
                </Text>
              ) : null
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 12 }}
          />
        )}

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
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator
                color="#fff"
                size="small"
              />
            ) : (
              <Ionicons
                name={text.trim() ? "send" : "mic"}
                size={20}
                color="#fff"
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Thêm vào StyleSheet:
//   avatarPlaceholder: { backgroundColor: COLORS.primarySoft, alignItems: "center", justifyContent: "center" },

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
  avatarPlaceholder: {
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

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
