import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  useFriendRequests,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
} from "@/hooks/useFriend";
import { AxiosError } from "axios";

// ========================================
// TYPES (khớp response /friends/requests)
// ========================================

type RequestUser = {
  _id: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null; // backend chưa trả thì dùng chữ cái đầu
  isOnline?: boolean;
};

type ReceivedRequest = {
  _id: string;
  from: RequestUser;
  message?: string;
  createdAt: string;
};

type SentRequest = {
  _id: string;
  to: RequestUser;
  message?: string;
  createdAt: string;
};

type Tab = "received" | "sent";

// ========================================
// HELPERS
// ========================================

const matchUser = (u: RequestUser, keyword: string) => {
  const k = keyword.trim().toLowerCase().replace(/^@/, "");
  if (!k) return true;
  return (
    u.displayName?.toLowerCase().includes(k) || u.username?.toLowerCase().includes(k)
  );
};

// ========================================
// POPUP XÁC NHẬN TỪ CHỐI
// ========================================

function ConfirmDeclineModal({
  visible,
  user,
  loading,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  user: RequestUser;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={loading ? undefined : onCancel}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-6">
        {/* Bấm ra ngoài để đóng (không cho đóng khi đang gọi API) */}
        <Pressable
          className="absolute inset-0"
          onPress={loading ? undefined : onCancel}
        />

        <View className="w-full max-w-[340px] bg-white rounded-[20px] p-5 items-center">
          <View className="w-14 h-14 rounded-full bg-red-100 items-center justify-center mb-3">
            <Ionicons
              name="person-remove-outline"
              size={26}
              color="#DC2626"
            />
          </View>

          <Text className="text-lg font-bold text-gray-900">Từ chối lời mời?</Text>
          <Text className="text-sm leading-[21px] text-gray-600 text-center mt-2">
            Bạn có chắc muốn từ chối lời mời kết bạn từ{" "}
            <Text className="font-bold text-gray-900">{user.displayName}</Text> (@
            {user.username}) không?
          </Text>

          <View className="flex-row gap-2.5 mt-5 self-stretch">
            <Pressable
              className="flex-1 h-[46px] rounded-[14px] items-center justify-center bg-indigo-100"
              disabled={loading}
              onPress={onCancel}
            >
              <Text className="text-gray-700 font-bold text-[15px]">Hủy</Text>
            </Pressable>

            <Pressable
              className="flex-1 h-[46px] rounded-[14px] items-center justify-center bg-red-600"
              disabled={loading}
              onPress={onConfirm}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                />
              ) : (
                <Text className="text-white font-bold text-[15px]">Từ chối</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ========================================
// AVATAR
// ========================================

function Avatar({ user }: { user: RequestUser }) {
  const initials = user.displayName?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <View className="w-14 h-14 relative">
      {user.avatarUrl ? (
        <Image
          source={{ uri: user.avatarUrl }}
          className="w-14 h-14 rounded-full"
        />
      ) : (
        <View className="w-14 h-14 rounded-full bg-indigo-100 items-center justify-center">
          <Text className="text-[22px] font-bold text-indigo-800">{initials}</Text>
        </View>
      )}
      {user.isOnline !== undefined && (
        <View
          className={`absolute right-0 bottom-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
            user.isOnline ? "bg-emerald-400" : "bg-slate-300"
          }`}
        />
      )}
    </View>
  );
}

// ========================================
// CARD: LỜI MỜI ĐÃ NHẬN
// ========================================
function ReceivedCard({ item }: { item: ReceivedRequest }) {
  const accept = useAcceptFriendRequest();
  const decline = useDeclineFriendRequest();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const busy = accept.isPending || decline.isPending;

  const handleAccept = () => {
    accept.mutate(item._id, {
      onError: (err) => {
        const e = err as AxiosError<{ message?: string }>;
        console.log("ACCEPT ERROR", {
          url: e.config?.url,
          method: e.config?.method,
          status: e.response?.status,
          data: e.response?.data,
          msg: e.message,
        });

        Alert.alert(
          "Lỗi",
          e.response?.data?.message ??
            "Không thể chấp nhận lời mời. Vui lòng thử lại.",
        );
      },
    });
  };
  const handleConfirmDecline = () => {
    decline.mutate(item._id, {
      onSuccess: () => setConfirmOpen(false),
      onError: () => {
        setConfirmOpen(false);
        Alert.alert("Lỗi", "Không thể từ chối lời mời. Vui lòng thử lại.");
      },
    });
  };

  return (
    <View className="bg-white rounded-[18px] p-3.5 mb-3 shadow-sm">
      <View className="flex-row items-center gap-3">
        <Avatar user={item.from} />
        <View className="flex-1 min-w-0">
          <Text
            className="text-[17px] font-bold text-gray-900"
            numberOfLines={1}
          >
            {item.from.displayName}
          </Text>
          <Text
            className="text-sm text-gray-500 mt-0.5"
            numberOfLines={1}
          >
            @{item.from.username}
          </Text>
        </View>
      </View>

      {!!item.message && (
        <View className="mt-3 bg-indigo-50 rounded-xl px-3 py-2.5">
          <Text className="text-[15px] leading-[22px] text-gray-800">
            “{item.message}”
          </Text>
        </View>
      )}

      <View className="flex-row gap-2.5 mt-3">
        {/* Từ chối: mở popup xác nhận, chưa gọi API */}
        <Pressable
          className="flex-1 h-[46px] rounded-[14px] flex-row items-center justify-center gap-1.5 bg-indigo-100"
          disabled={busy}
          onPress={() => setConfirmOpen(true)}
        >
          <Ionicons
            name="close"
            size={16}
            color="#4B5563"
          />
          <Text className="text-gray-700 font-bold text-[15px]">Từ chối</Text>
        </Pressable>

        {/* Đồng ý: gọi API ngay */}
        <Pressable
          className="flex-1 h-[46px] rounded-[14px] flex-row items-center justify-center gap-1.5 bg-[#5144E4]"
          disabled={busy}
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
                size={16}
                color="#fff"
              />
              <Text className="text-white font-bold text-[15px]">Đồng ý</Text>
            </>
          )}
        </Pressable>
      </View>

      <ConfirmDeclineModal
        visible={confirmOpen}
        user={item.from}
        loading={decline.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDecline}
      />
    </View>
  );
}

// ========================================
// CARD: LỜI MỜI ĐÃ GỬI
// ========================================

function SentCard({ item }: { item: SentRequest }) {
  const cancel = useDeclineFriendRequest(); // API decline dùng chung cho huỷ lời mời

  return (
    <View className="bg-white rounded-[18px] p-3.5 mb-3 shadow-sm">
      <View className="flex-row items-center gap-3">
        <Avatar user={item.to} />

        <View className="flex-1 min-w-0">
          <Text
            className="text-[17px] font-bold text-gray-900"
            numberOfLines={1}
          >
            {item.to.displayName}
          </Text>
          <Text
            className="text-sm text-gray-500 mt-0.5"
            numberOfLines={1}
          >
            @{item.to.username}
          </Text>
        </View>

        <View className="items-end self-start gap-1.5">
          <View className="flex-row items-center gap-1.5 bg-indigo-100 rounded-[10px] px-2.5 py-1">
            <View className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <Text className="text-xs font-bold text-indigo-600">Đang chờ</Text>
          </View>

          <Pressable
            hitSlop={8}
            disabled={cancel.isPending}
            onPress={() => cancel.mutate(item._id)}
          >
            {cancel.isPending ? (
              <ActivityIndicator
                size="small"
                color="#DC2626"
              />
            ) : (
              <Text className="text-[11px] font-semibold text-red-600">
                Hủy lời mời
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {!!item.message && (
        <View className="mt-3 bg-indigo-50 rounded-xl px-3 py-2.5">
          <Text className="text-[15px] leading-[22px] text-gray-800">
            “{item.message}”
          </Text>
        </View>
      )}
    </View>
  );
}

// ========================================
// SCREEN
// ========================================

export default function FriendRequestsScreen() {
  const [tab, setTab] = useState<Tab>("received");

  const [keyword, setKeyword] = useState("");

  const { data, isLoading, isError, refetch, isRefetching } = useFriendRequests();

  const received: ReceivedRequest[] = data?.received ?? [];
  const sent: SentRequest[] = data?.sent ?? [];

  const receivedCount = data?.counts?.received ?? received.length;
  const sentCount = data?.counts?.sent ?? sent.length;

  const filteredReceived = useMemo(
    () => received.filter((r) => matchUser(r.from, keyword)),
    [received, keyword],
  );
  const filteredSent = useMemo(
    () => sent.filter((r) => matchUser(r.to, keyword)),
    [sent, keyword],
  );

  // ---------- Tab switcher ----------
  const TabButton = ({
    k,
    label,
    icon,
    count,
  }: {
    k: Tab;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    count: number;
  }) => {
    const active = tab === k;
    return (
      <Pressable
        onPress={() => setTab(k)}
        className={`flex-1 h-11 rounded-xl flex-row items-center justify-center gap-1.5 ${active ? "bg-white" : ""}`}
      >
        <Ionicons
          name={icon}
          size={16}
          color={active ? "#4F46E5" : "#374151"}
        />
        <Text
          className={`text-[15px] font-bold ${active ? "text-indigo-600" : "text-gray-700"}`}
        >
          {label}
        </Text>
        <View
          className={`min-w-[22px] h-[22px] rounded-full px-1.5 items-center justify-center ${active ? "bg-[#5144E4]" : ""}`}
        >
          <Text
            className={`text-xs font-bold ${active ? "text-white" : "text-gray-500"}`}
          >
            {count}
          </Text>
        </View>
      </Pressable>
    );
  };

  // ---------- Header (tabs + search) ----------
  const Header = (
    <View className="px-3 pt-3 mb-1.5">
      <View className="flex-row bg-[#E0E3FA] rounded-2xl p-1">
        <TabButton
          k="received"
          label="Đã nhận"
          icon="download-outline"
          count={receivedCount}
        />
        <TabButton
          k="sent"
          label="Đã gửi"
          icon="paper-plane-outline"
          count={sentCount}
        />
      </View>
    </View>
  );

  // ---------- Empty ----------
  const Empty = (
    <View className="flex-1 items-center justify-center py-[60px] px-6 gap-2">
      <Ionicons
        name={tab === "received" ? "mail-open-outline" : "paper-plane-outline"}
        size={40}
        color="#A5B4FC"
      />
      <Text className="text-[15px] font-bold text-gray-700 mt-1">
        {keyword
          ? "Không có kết quả phù hợp"
          : tab === "received"
            ? "Chưa có lời mời nào"
            : "Bạn chưa gửi lời mời nào"}
      </Text>
      <Text className="text-[13px] text-gray-500 text-center">
        {tab === "received"
          ? "Khi có người gửi lời mời kết bạn, bạn sẽ thấy ở đây."
          : "Tìm bạn bè ở tab Tin nhắn để gửi lời mời kết bạn."}
      </Text>
    </View>
  );

  // ---------- Loading / Error ----------
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EEF0FD] p-6">
        <ActivityIndicator
          size="large"
          color="#4F46E5"
        />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EEF0FD] p-6">
        <Text className="text-sm text-red-600 text-center">
          Không thể tải lời mời kết bạn.
        </Text>
        <Pressable
          className="mt-3.5 px-5 py-2.5 rounded-[10px] bg-[#5144E4]"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  // ---------- Main ----------
  return (
    <SafeAreaView
      className="flex-1 bg-[#EEF0FD] pt-[50px]"
      edges={["bottom"]}
    >
      {Header}

      {tab === "received" ? (
        <FlatList
          data={filteredReceived}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <ReceivedCard item={item} />}
          ListEmptyComponent={Empty}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={["#4F46E5"]}
            />
          }
          contentContainerClassName="px-3 pb-6 flex-grow"
        />
      ) : (
        <FlatList
          data={filteredSent}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <SentCard item={item} />}
          ListEmptyComponent={Empty}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={["#4F46E5"]}
            />
          }
          contentContainerClassName="px-3 pb-6 flex-grow"
        />
      )}
    </SafeAreaView>
  );
}
