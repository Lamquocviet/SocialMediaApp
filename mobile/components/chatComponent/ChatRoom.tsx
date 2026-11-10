import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";

import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  useConversations,
  useMessages,
  useSendDirectMessage,
  useSendGroupMessage,
  useMarkAsSeen,
} from "@/hooks/useChat";

import { useMe } from "@/hooks/useMe";
import type { Message, ConversationType } from "@/types/chat";

type Props = {
  conversationId?: string;
  recipientId?: string;
  fallbackType?: ConversationType;
  fallbackName?: string;
  fallbackAvatar?: string;
  onBack: () => void;
  onConversationCreated?: (id: string) => void;
};

const COLORS = {
  primary: "#3B2FD0",
  sub: "#6B7280",
};

// ========================================
// HELPERS
// ========================================

const formatTime = (iso: string) => {
  const d = new Date(iso);

  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
    2,
    "0",
  )}`;
};

// ========================================
// AVATAR
// ========================================

function Avatar({ uri, size = 44 }: { uri?: string | null; size?: number }) {
  const sizeClass =
    size === 24 ? "h-6 w-6" : size === 44 ? "h-11 w-11" : "h-12 w-12";

  const iconSize = size * 0.55;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        className={`${sizeClass} rounded-full`}
      />
    );
  }

  return (
    <View
      className={`${sizeClass} items-center justify-center rounded-full bg-[#EEEBFF]`}
    >
      <Ionicons
        name="person"
        size={iconSize}
        color={COLORS.primary}
      />
    </View>
  );
}

// ========================================
// CHAT ROOM
// ========================================

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

  const effectiveRecipientId =
    recipientId ?? conversation?.participants.find((p) => p._id !== me?._id)?._id;

  const isGroup = (conversation?.type ?? fallbackType) === "group";

  // Conversation information
  const other = conversation?.participants.find(
    (p) => String(p._id) !== String(me?._id),
  );

  const conversationDisplayName = isGroup
    ? conversation?.group?.name
    : other?.displayName;

  const title =
    conversationDisplayName ?? fallbackName ?? (isGroup ? "Nhóm" : "Người dùng");

  const headerAvatar = isGroup ? null : (other?.avatarUrl ?? fallbackAvatar ?? null);

  const memberCount = conversation?.participants.length ?? 0;

  const participantMap = useMemo(
    () => new Map((conversation?.participants ?? []).map((p) => [p._id, p])),
    [conversation],
  );

  // Messages
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

  // Mark as seen
  const unread = me?._id ? (conversation?.unreadCounts?.[String(me._id)] ?? 0) : 0;

  useEffect(() => {
    if (conversationId && unread > 0) {
      markAsSeen(conversationId);
    }
  }, [conversationId, unread]);

  // Seen status
  const seenByOthers = !!conversation?.seenBy?.some(
    (u) => String(u._id) !== String(me?._id),
  );

  const lastMessageId = conversation?.lastMessage?._id;

  // ========================================
  // SEND MESSAGE
  // ========================================

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
          recipientId: effectiveRecipientId,
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

  // ========================================
  // RENDER MESSAGE
  // ========================================

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const mine = String(item.senderId) === String(me?._id);

      const sender = participantMap.get(item.senderId);

      // Inverted list
      const older = messages[index + 1];
      const newer = messages[index - 1];

      const firstOfCluster = older?.senderId !== item.senderId;

      const lastOfCluster = newer?.senderId !== item.senderId;

      return (
        <View
          className={`mb-[10px] flex-row items-end px-3 ${
            mine ? "justify-end" : "justify-start"
          } ${!lastOfCluster ? "mb-[3px]" : ""}`}
        >
          {!mine && (
            <View className="mr-1.5 w-7">
              {lastOfCluster && (
                <Avatar
                  uri={sender?.avatarUrl}
                  size={24}
                />
              )}
            </View>
          )}

          <View className="max-w-[78%]">
            <View
              className={`rounded-2xl px-3 pt-2.5 pb-1.5 ${
                mine
                  ? "rounded-br-md bg-[#3B2FD0]"
                  : "rounded-bl-md border border-slate-100 bg-white"
              }`}
            >
              {/* Group sender name */}
              {isGroup && !mine && firstOfCluster && !!sender?.displayName && (
                <Text className="mb-1 text-xs font-bold text-[#5144E4]">
                  {sender.displayName}
                </Text>
              )}

              {/* Image */}
              {!!item.imgUrl && (
                <Image
                  source={{ uri: item.imgUrl }}
                  className="mb-1.5 h-[150px] w-[230px] rounded-xl bg-gray-200"
                  resizeMode="cover"
                />
              )}

              {/* Message content */}
              {!!item.content && (
                <Text
                  className={`text-sm leading-5 ${
                    mine ? "font-medium text-white" : "text-slate-800"
                  }`}
                >
                  {item.content}
                </Text>
              )}

              {/* Time + seen */}
              <View className="mt-1 flex-row items-center justify-end gap-1">
                <Text
                  className={`text-[11px] ${
                    mine ? "text-[#D6D3FF]" : "text-gray-400"
                  }`}
                >
                  {formatTime(item.createdAt)}
                </Text>

                {mine && item._id === lastMessageId && (
                  <Ionicons
                    name={seenByOthers ? "checkmark-done" : "checkmark"}
                    size={14}
                    color="#9AD7FF"
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

  // ========================================
  // UI
  // ========================================

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["top", "bottom"]}
    >
      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <View className="flex-row items-center border-b border-slate-100 bg-white px-4 py-3">
        {/* Back */}
        <TouchableOpacity
          onPress={onBack}
          hitSlop={10}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full active:bg-slate-100"
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color="#1B1B2F"
          />
        </TouchableOpacity>

        {/* Avatar */}
        {isGroup ? (
          <View className="h-11 w-11 items-center justify-center rounded-full bg-[#EEEBFF]">
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

        {/* Contact information */}
        <View className="ml-3 min-w-0 flex-1">
          <Text
            className="text-base font-bold text-slate-900"
            numberOfLines={1}
          >
            {title}
          </Text>

          {isGroup && (
            <Text className="mt-0.5 text-xs text-slate-500">
              {memberCount} thành viên
            </Text>
          )}
        </View>

        {/* Actions */}
        <View className="flex-row items-center gap-2">
          {!isGroup && (
            <>
              <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-xl bg-slate-50 active:bg-slate-100">
                <Ionicons
                  name="call-outline"
                  size={18}
                  color="#374151"
                />
              </TouchableOpacity>

              <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-xl bg-slate-50 active:bg-slate-100">
                <Ionicons
                  name="videocam-outline"
                  size={20}
                  color="#374151"
                />
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-xl bg-slate-50 active:bg-slate-100">
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#374151"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ================================== */}
      {/* CHAT CONTENT */}
      {/* ================================== */}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {isLoading && !!conversationId ? (
          <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />
          </View>
        ) : (
          <FlatList
            data={messages}
            inverted
            keyExtractor={(m) => m._id}
            renderItem={renderItem}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator
                  color={COLORS.primary}
                  className="my-2"
                />
              ) : null
            }
            ListEmptyComponent={
              !isLoading ? (
                <View className="flex-1 items-center justify-center py-8">
                  <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-[#EEEBFF]">
                    <Ionicons
                      name="chatbubbles-outline"
                      size={30}
                      color={COLORS.primary}
                    />
                  </View>

                  <Text className="text-sm font-semibold text-slate-600">
                    Hãy bắt đầu cuộc trò chuyện 👋
                  </Text>
                </View>
              ) : null
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 12 }}
          />
        )}

        {/* ================================== */}
        {/* INPUT BAR */}
        {/* ================================== */}

        <View className="flex-row items-center gap-2.5 border-t border-slate-100 bg-white px-3 py-2">
          {/* Attachment */}
          <TouchableOpacity
            hitSlop={8}
            className="h-10 w-9 items-center justify-center"
          >
            <Ionicons
              name="attach"
              size={24}
              color="#6B7280"
            />
          </TouchableOpacity>

          {/* Input container */}
          <View className="h-[44px] flex-1 flex-row items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3">
            <TouchableOpacity hitSlop={8}>
              <Ionicons
                name="happy-outline"
                size={22}
                color="#6B7280"
              />
            </TouchableOpacity>

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 py-0 text-sm text-slate-900"
              onSubmitEditing={send}
              returnKeyType="send"
            />

            <TouchableOpacity hitSlop={8}>
              <Ionicons
                name="camera-outline"
                size={22}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {/* Send button */}
          <TouchableOpacity
            className="h-11 w-11 items-center justify-center rounded-full bg-[#3B2FD0] active:bg-[#3025B5]"
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
