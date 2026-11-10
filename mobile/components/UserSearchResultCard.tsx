import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SearchUser } from "@/hooks/useUserSearch";
import {
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
} from "@/hooks/useFriend";

type Props = {
  user: SearchUser;
  receivedCreatedAt?: string; // lấy từ useFriendRequests().received
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
  const isReceived = status === "request_received";
  const initials = user.displayName?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && status === "friends" && styles.cardPressed,
      ]}
      disabled={status !== "friends"}
      onPress={() => onMessage?.(user)}
    >
      <View style={styles.row}>
        {/* Avatar + chấm online */}
        <View style={styles.avatarWrap}>
          {user.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          {user.isOnline !== undefined && (
            <View
              style={[
                styles.dot,
                { backgroundColor: user.isOnline ? "#22C55E" : "#9CA3AF" },
              ]}
            />
          )}
        </View>

        {/* Thông tin */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {user.displayName}
            </Text>
            {user.title && !isReceived && status !== "friends" && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user.title}</Text>
              </View>
            )}
            {status === "friends" && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Bạn bè</Text>
              </View>
            )}
            {isReceived && (
              <View style={[styles.badge, styles.badgeInvite]}>
                <Ionicons
                  name="mail-outline"
                  size={11}
                  color="#4C1D95"
                />
                <Text style={styles.badgeText}>Lời mời</Text>
              </View>
            )}
          </View>
          <Text
            style={styles.username}
            numberOfLines={1}
          >
            @{user.username}
          </Text>
          {user.isOnline !== undefined && (
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.smallDot,
                  { backgroundColor: user.isOnline ? "#22C55E" : "#9CA3AF" },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: user.isOnline ? "#15803D" : "#6B7280" },
                ]}
              >
                {user.isOnline
                  ? "Đang hoạt động"
                  : (user.lastActiveText ?? "Ngoại tuyến")}
              </Text>
            </View>
          )}
        </View>

        {/* Hành động bên phải */}
        {status === "not_friends" && (
          <Pressable
            style={[styles.btn, styles.btnPrimary]}
            disabled={send.isPending}
            onPress={() => send.mutate({ to: user._id })}
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
                <Text style={styles.btnPrimaryText}>Kết bạn</Text>
              </>
            )}
          </Pressable>
        )}

        {status === "request_sent" && (
          <View style={styles.sentWrap}>
            <Ionicons
              name="paper-plane-outline"
              size={13}
              color="#6B7280"
            />
            <Text style={styles.sentText}>Đã gửi lời mời</Text>
            <Pressable
              style={styles.cancelBtn}
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
            style={[styles.btn, styles.btnMessage]}
            onPress={() => onMessage?.(user)}
          >
            <Ionicons
              name="chatbubble"
              size={15}
              color="#3730A3"
            />
            <Text style={styles.btnMessageText}>Nhắn tin</Text>
          </Pressable>
        )}
      </View>

      {/* Lời mời nhận được: banner + 2 nút */}
      {isReceived && user.requestId && (
        <>
          <View style={styles.banner}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#4338CA"
            />
            <Text style={styles.bannerText}>
              Đã gửi lời mời kết bạn cho bạn {timeAgo(receivedCreatedAt)}
            </Text>
          </View>
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.bigBtn, styles.acceptBtn]}
              disabled={accept.isPending || decline.isPending}
              onPress={() => accept.mutate(user.requestId!)}
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
                  <Text style={styles.acceptText}>Đồng ý</Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={[styles.bigBtn, styles.declineBtn]}
              disabled={accept.isPending || decline.isPending}
              onPress={() => decline.mutate(user.requestId!)}
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
                  <Text style={styles.declineText}>Từ chối</Text>
                </>
              )}
            </Pressable>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F4F2FF", // nền tím nhạt
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#D6D1FA", // khung tím
    padding: 14,
    marginBottom: 12,

    shadowColor: "#5144E4", // bóng đổ ánh tím
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardPressed: {
    backgroundColor: "#EBE8FE",
    borderColor: "#B9B2F5",
    transform: [{ scale: 0.99 }],
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarWrap: { width: 48, height: 48 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: {
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#3730A3" },
  dot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#F4F2FF", // trùng màu nền card (trước là #fff)
  },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { flexShrink: 1, fontSize: 17, fontWeight: "700", color: "#111827" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#E2DDFD",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeInvite: { backgroundColor: "#E4DDFB" },
  badgeText: { fontSize: 10, fontWeight: "600", color: "#4C1D95" },
  username: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  smallDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "500" },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  btnPrimary: { backgroundColor: "#3B2FC9" },
  btnPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  btnMessage: { backgroundColor: "#E0E0FB" },
  btnMessageText: { color: "#3730A3", fontWeight: "700", fontSize: 14 },

  sentWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  sentText: { fontSize: 12, color: "#6B7280", marginRight: 4 },
  cancelBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff", // trắng nổi bật trên nền tím
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E4E0FB",
  },
  bannerText: { flex: 1, fontSize: 12, color: "#3730A3" },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  bigBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  acceptBtn: { backgroundColor: "#0B6B4D" },
  acceptText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  declineBtn: { backgroundColor: "#FEE2E2" },
  declineText: { color: "#DC2626", fontWeight: "700", fontSize: 14 },
});
