import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AxiosError } from "axios";
import SendRequestModal from "@/components/friendModals/SendRequestModal";
import ConfirmModal from "@/components/friendModals/ConfirmModal";

import type { SearchUser } from "@/hooks/useUserSearch";
import {
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
} from "@/hooks/useFriend";

type Props = {
  user: SearchUser;
  receivedCreatedAt?: string;
  onMessage?: (user: SearchUser) => void;
};

export function timeAgo(iso?: string) {
  if (!iso) return "";

  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);

  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;

  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;

  return `${Math.floor(h / 24)} ngày trước`;
}

export default function UserSearchResultCard({
  user,
  receivedCreatedAt,
  onMessage,
}: Props) {
  const send = useSendFriendRequest();
  const accept = useAcceptFriendRequest();
  const decline = useDeclineFriendRequest();
  const cancel = useDeclineFriendRequest();

  const status = user.friendshipStatus;
  const [sendOpen, setSendOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const isReceived = status === "request_received";
  const initials = user.displayName?.trim()?.[0]?.toUpperCase() ?? "?";

  const errorMessage = (err: unknown, fallback: string) =>
    (err as AxiosError<{ message?: string }>)?.response?.data?.message ?? fallback;

  const handleSend = (message: string) => {
    send.mutate(
      { to: user._id, message: message || undefined },
      {
        onSuccess: () => setSendOpen(false),
        onError: (err) => {
          setSendOpen(false);
          Alert.alert("Lỗi", errorMessage(err, "Không thể gửi lời mời."));
        },
      },
    );
  };

  const handleConfirmDecline = () => {
    if (!user.requestId) return;
    decline.mutate(user.requestId, {
      onSuccess: () => setDeclineOpen(false),
      onError: (err) => {
        setDeclineOpen(false);
        Alert.alert("Lỗi", errorMessage(err, "Không thể từ chối lời mời."));
      },
    });
  };

  const handleAccept = () => {
    if (!user.requestId) return;
    accept.mutate(user.requestId, {
      onError: (err) =>
        Alert.alert("Lỗi", errorMessage(err, "Không thể chấp nhận lời mời.")),
    });
  };
  return (
    <>
      <Pressable
        className={`mb-3 rounded-[18px] border-[1.5px] border-[#D6D1FA] bg-[#F4F2FF] p-[14px] shadow-md ${
          status === "friends" ? "active:bg-[#EBE8FE]" : ""
        }`}
        disabled={status !== "friends"}
        onPress={() => onMessage?.(user)}
      >
        <View className="flex-row items-center gap-[10px]">
          {/* Avatar + online status */}
          <View className="relative h-12 w-12">
            {user.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <View className="h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                <Text className="text-lg font-bold text-indigo-800">{initials}</Text>
              </View>
            )}

            {user.isOnline !== undefined && (
              <View
                className={`absolute bottom-0 right-0 h-[13px] w-[13px] rounded-full border-2 border-[#F4F2FF] ${
                  user.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            )}
          </View>

          {/* User information */}
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text
                className="shrink text-[17px] font-bold text-gray-900"
                numberOfLines={1}
              >
                {user.displayName}
              </Text>

              {user.title && !isReceived && status !== "friends" && (
                <View className="rounded-md bg-[#E2DDFD] px-1.5 py-0.5">
                  <Text className="text-[10px] font-semibold text-purple-900">
                    {user.title}
                  </Text>
                </View>
              )}

              {status === "friends" && (
                <View className="rounded-md bg-[#E2DDFD] px-1.5 py-0.5">
                  <Text className="text-[10px] font-semibold text-purple-900">
                    Bạn bè
                  </Text>
                </View>
              )}

              {isReceived && (
                <View className="flex-row items-center gap-1 rounded-md bg-[#E4DDFB] px-1.5 py-0.5">
                  <Ionicons
                    name="mail-outline"
                    size={11}
                    color="#4C1D95"
                  />
                  <Text className="text-[10px] font-semibold text-purple-900">
                    Lời mời
                  </Text>
                </View>
              )}
            </View>

            <Text
              className="mt-px text-xs text-gray-500"
              numberOfLines={1}
            >
              @{user.username}
            </Text>

            {user.isOnline !== undefined && (
              <View className="mt-[3px] flex-row items-center gap-1">
                <View
                  className={`h-1.5 w-1.5 rounded-full ${
                    user.isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <Text
                  className={`text-[11px] font-medium ${
                    user.isOnline ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  {user.isOnline
                    ? "Đang hoạt động"
                    : (user.lastActiveText ?? "Ngoại tuyến")}
                </Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          {status === "not_friends" && (
            <Pressable
              className="h-10 flex-row items-center justify-center gap-1.5 rounded-xl bg-[#3B2FC9] px-3.5 active:opacity-80"
              onPress={() => setSendOpen(true)}
            >
              {send.isPending ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                />
              ) : (
                <>
                  <Ionicons
                    name="person-add-outline"
                    size={17}
                    color="#fff"
                  />
                  <Text className="text-sm font-bold text-white">Kết bạn</Text>
                </>
              )}
            </Pressable>
          )}

          {status === "request_sent" && (
            <View className="flex-row items-center gap-1">
              <Ionicons
                name="paper-plane-outline"
                size={13}
                color="#6B7280"
              />
              <Text className="mr-1 text-xs text-gray-500">Đã gửi lời mời</Text>

              <Pressable
                className="h-[42px] w-[42px] items-center justify-center rounded-xl bg-red-100 active:opacity-70"
                disabled={cancel.isPending || !user.requestId}
                onPress={() => user.requestId && cancel.mutate(user.requestId)}
              >
                {cancel.isPending ? (
                  <ActivityIndicator
                    size="small"
                    color="#DC2626"
                  />
                ) : (
                  <Ionicons
                    name="close"
                    size={20}
                    color="#DC2626"
                  />
                )}
              </Pressable>
            </View>
          )}

          {status === "friends" && (
            <Pressable
              className="h-10 flex-row items-center justify-center gap-1.5 rounded-xl bg-[#E0E0FB] px-3.5 active:opacity-80"
              onPress={() => onMessage?.(user)}
            >
              <Ionicons
                name="chatbubble"
                size={15}
                color="#3730A3"
              />
              <Text className="text-sm font-bold text-indigo-800">Nhắn tin</Text>
            </Pressable>
          )}
        </View>

        {/* Received friend request */}
        {isReceived && user.requestId && (
          <>
            <View className="mt-3 flex-row items-center gap-2 rounded-[10px] border border-[#E4E0FB] bg-white px-3 py-2.5">
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#4338CA"
              />
              <Text className="flex-1 text-xs text-indigo-800">
                Đã gửi lời mời kết bạn cho bạn {timeAgo(receivedCreatedAt)}
              </Text>
            </View>

            <View className="mt-3 flex-row gap-2.5">
              <Pressable
                className="h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-[10px] bg-[#0B6B4D] active:opacity-80"
                disabled={accept.isPending || decline.isPending}
                onPress={handleAccept}
              >
                {accept.isPending ? (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#fff"
                    />
                    <Text className="text-sm font-bold text-white">Đồng ý</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                className="h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-[10px] bg-red-100 active:opacity-80"
                disabled={accept.isPending || decline.isPending}
                onPress={() => setDeclineOpen(true)}
              >
                {decline.isPending ? (
                  <ActivityIndicator
                    size="small"
                    color="#DC2626"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="close"
                      size={18}
                      color="#DC2626"
                    />
                    <Text className="text-sm font-bold text-red-600">Từ chối</Text>
                  </>
                )}
              </Pressable>
            </View>
          </>
        )}
      </Pressable>
      <SendRequestModal
        visible={sendOpen}
        displayName={user.displayName}
        username={user.username}
        loading={send.isPending}
        onCancel={() => setSendOpen(false)}
        onSend={handleSend}
      />

      <ConfirmModal
        visible={declineOpen}
        title="Từ chối lời mời?"
        description={
          <>
            Bạn có chắc muốn từ chối lời mời kết bạn từ{" "}
            <Text className="font-bold text-gray-900">{user.displayName}</Text> (@
            {user.username}) không?
          </>
        }
        confirmText="Từ chối"
        loading={decline.isPending}
        onCancel={() => setDeclineOpen(false)}
        onConfirm={handleConfirmDecline}
      />
    </>
  );
}
