import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";

import {
  Alert,
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";

import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import {
  useConversations,
  useMessages,
  useSendDirectMessage,
  useSendGroupMessage,
  useMarkAsSeen,
} from "@/hooks/useChat";

import { useMe } from "@/hooks/useMe";
import AudioMessage from "@/components/chatComponent/AudioMessage";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import type { MediaFile, Message, ConversationType } from "@/types/chat";

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

// HELPERS
const formatTime = (iso: string) => {
  const d = new Date(iso);

  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
    2,
    "0",
  )}`;
};

const formatDuration = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const toMediaFile = (asset: ImagePicker.ImagePickerAsset): MediaFile => {
  const ext = asset.uri.split(".").pop() || "jpg";
  return {
    uri: asset.uri,
    name: asset.fileName ?? `photo.${ext}`,
    type: asset.mimeType ?? "image/jpeg",
  };
};

// AVATAR
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

// CHAT ROOM
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
  const [pendingImage, setPendingImage] = useState<MediaFile | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const voice = useVoiceRecorder();
  const insets = useSafeAreaInsets();

  const listRef = useRef<FlatList<Message>>(null);
  const didInitialScroll = useRef(false);
  const prevLastId = useRef<string | undefined>(undefined);

  const { data: me } = useMe();
  const { data: convData } = useConversations();

  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated }), 100);
  }, []);

  // Bàn phím mở thì cuộn xuống tin mới nhất
  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const show = Keyboard.addListener(showEvt, () => {
      setKeyboardVisible(true);
      scrollToBottom();
    });
    const hide = Keyboard.addListener(hideEvt, () => setKeyboardVisible(false));

    return () => {
      show.remove();
      hide.remove();
    };
  }, [scrollToBottom]);

  // Có bàn phím thì không cần chừa vùng an toàn phía dưới
  const bottomPad = keyboardVisible ? 8 : Math.max(insets.bottom, 8);

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

  const headerAvatar = isGroup
    ? (conversation?.group?.avatarUrl ?? fallbackAvatar ?? null)
    : (other?.profilePicture ?? fallbackAvatar ?? null);

  const memberCount = conversation?.participants.length ?? 0;

  const participantMap = useMemo(
    () => new Map((conversation?.participants ?? []).map((p) => [p._id, p])),
    [conversation],
  );

  // Messages
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessages(conversationId ?? "");

  // pages[0] là trang mới nhất, mỗi trang đã xếp cũ -> mới
  // => đảo thứ tự trang để toàn bộ danh sách: cũ ở trên, mới ở dưới
  const messages = useMemo(
    () => [...(data?.pages ?? [])].reverse().flatMap((p) => p.messages),
    [data],
  );

  // Có tin mới ở cuối thì tự cuộn xuống (tải thêm tin cũ không làm đổi lastId)
  const lastId = messages[messages.length - 1]?._id;
  useEffect(() => {
    if (!lastId) return;
    if (prevLastId.current && prevLastId.current !== lastId) scrollToBottom();
    prevLastId.current = lastId;
  }, [lastId, scrollToBottom]);

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

  // SEND MESSAGE (text / ảnh / audio)
  const sendMessage = async (extra: {
    content?: string;
    image?: MediaFile;
    audio?: MediaFile;
    audioDuration?: number;
  }) => {
    if (isGroup) {
      await sendGroup.mutateAsync({ conversationId: conversationId!, ...extra });
    } else {
      const msg = await sendDirect.mutateAsync({
        conversationId,
        recipientId: effectiveRecipientId,
        ...extra,
      });

      if (!conversationId && msg?.conversationId) {
        onConversationCreated?.(String(msg.conversationId));
      }
    }
  };

  // Gửi text và/hoặc ảnh đang chờ
  const send = async () => {
    const value = text.trim();
    if ((!value && !pendingImage) || sending) return;

    const image = pendingImage;
    setText("");
    setPendingImage(null);

    try {
      await sendMessage({
        content: value || undefined,
        image: image ?? undefined,
      });
      scrollToBottom();
    } catch {
      setText(value);
      setPendingImage(image);
      Alert.alert("Không gửi được tin nhắn", "Vui lòng thử lại.");
    }
  };

  // Gửi tin nhắn thoại
  const sendVoice = async () => {
    const result = await voice.stop();
    if (!result) return;

    if (result.duration < 1) {
      Alert.alert("Tin nhắn quá ngắn", "Hãy ghi âm ít nhất 1 giây.");
      return;
    }

    try {
      await sendMessage({ audio: result.file, audioDuration: result.duration });
      scrollToBottom();
    } catch {
      Alert.alert("Không gửi được tin nhắn thoại", "Vui lòng thử lại.");
    }
  };

  // Chọn ảnh
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Cần quyền truy cập thư viện ảnh");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7, // nén bớt để không vượt giới hạn dung lượng
    });
    if (!res.canceled) setPendingImage(toMediaFile(res.assets[0]));
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Cần quyền camera");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled) setPendingImage(toMediaFile(res.assets[0]));
  };

  // RENDER MESSAGE
  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const mine = String(item.senderId) === String(me?._id);

      const sender = participantMap.get(item.senderId);

      // Danh sách thường (cũ ở trên, mới ở dưới)
      const older = messages[index - 1];
      const newer = messages[index + 1];

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
                  uri={sender?.profilePicture}
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

              {/* Audio */}
              {!!item.audioUrl && (
                <AudioMessage
                  uri={item.audioUrl}
                  duration={item.audioDuration}
                  mine={mine}
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

  return (
    // Chỉ chừa vùng an toàn phía trên, phía dưới do thanh nhập tự xử lý
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["top"]}
    >
      {/* HEADER */}
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
        {isGroup && !headerAvatar ? (
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

      {/* CHAT CONTENT */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
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
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m._id}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            onContentSizeChange={() => {
              // Lần đầu mở phòng chat: nhảy thẳng xuống cuối, không animation
              if (!didInitialScroll.current && messages.length > 0) {
                didInitialScroll.current = true;
                listRef.current?.scrollToEnd({ animated: false });
              }
            }}
            onStartReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onStartReachedThreshold={0.3}
            ListHeaderComponent={
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
            contentContainerStyle={{
              paddingVertical: 12,
              flexGrow: messages.length === 0 ? 1 : undefined,
            }}
          />
        )}

        {/* PREVIEW ẢNH ĐANG CHỜ GỬI */}
        {!!pendingImage && !voice.isRecording && (
          <View className="border-t border-slate-100 bg-white px-4 pb-1 pt-3">
            <View className="h-20 w-20">
              <Image
                source={{ uri: pendingImage.uri }}
                className="h-20 w-20 rounded-xl bg-gray-200"
              />
              <TouchableOpacity
                onPress={() => setPendingImage(null)}
                hitSlop={8}
                className="absolute -right-2 -top-2 rounded-full bg-white"
              >
                <Ionicons
                  name="close-circle"
                  size={22}
                  color="#374151"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* INPUT BAR */}
        {voice.isRecording ? (
          // Thanh đang ghi âm
          <View
            className="flex-row items-center gap-2.5 border-t border-slate-100 bg-white px-3 pt-2"
            style={{ paddingBottom: bottomPad }}
          >
            <TouchableOpacity
              onPress={voice.cancel}
              hitSlop={8}
              className="h-10 w-9 items-center justify-center"
            >
              <Ionicons
                name="trash-outline"
                size={24}
                color="#EF4444"
              />
            </TouchableOpacity>

            <View className="h-[44px] flex-1 flex-row items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4">
              <View className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <Text className="text-sm font-semibold text-slate-700">
                {formatDuration(voice.seconds)}
              </Text>
              <Text className="text-xs text-slate-400">Đang ghi âm...</Text>
            </View>

            <TouchableOpacity
              className="h-11 w-11 items-center justify-center rounded-full bg-[#3B2FD0] active:bg-[#3025B5]"
              onPress={sendVoice}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator
                  color="#fff"
                  size="small"
                />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // Thanh nhập bình thường
          <View
            className="flex-row items-center gap-2.5 border-t border-slate-100 bg-white px-3 pt-2"
            style={{ paddingBottom: bottomPad }}
          >
            {/* Chọn ảnh từ thư viện */}
            <TouchableOpacity
              hitSlop={8}
              onPress={pickImage}
              className="h-10 w-9 items-center justify-center"
            >
              <Ionicons
                name="image-outline"
                size={24}
                color="#6B7280"
              />
            </TouchableOpacity>

            <View className="h-[44px] flex-1 flex-row items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3">
              <TextInput
                value={text}
                onChangeText={setText}
                onFocus={() => scrollToBottom()}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 py-0 text-sm text-slate-900"
                onSubmitEditing={send}
                returnKeyType="send"
              />

              {/* Chụp ảnh */}
              <TouchableOpacity
                hitSlop={8}
                onPress={takePhoto}
              >
                <Ionicons
                  name="camera-outline"
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {/* Gửi / Mic */}
            <TouchableOpacity
              className="h-11 w-11 items-center justify-center rounded-full bg-[#3B2FD0] active:bg-[#3025B5]"
              onPress={text.trim() || pendingImage ? send : voice.start}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator
                  color="#fff"
                  size="small"
                />
              ) : (
                <Ionicons
                  name={text.trim() || pendingImage ? "send" : "mic"}
                  size={20}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
