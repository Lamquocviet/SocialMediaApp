import React, { useMemo } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useSearchUsers, type SearchUser } from "@/hooks/useUserSearch";
import { useFriendRequests } from "@/hooks/useFriend";
import UserSearchResultCard from "./UserSearchResultCard";

type Props = {
  query: string;
  onMessage?: (user: SearchUser) => void;
};

export default function UserSearchResults({ query, onMessage }: Props) {
  const { users, total, isSearching, hasQuery, isError } = useSearchUsers(query);
  const { data: requests } = useFriendRequests();

  const receivedTime = useMemo(() => {
    const map = new Map<string, string>();
    (requests?.received ?? []).forEach((r: any) =>
      map.set(String(r._id), r.createdAt),
    );
    return map;
  }, [requests]);

  const byUsername = query.trim().startsWith("@");

  // Chưa gõ gì -> gợi ý nhẹ
  if (!hasQuery) {
    return (
      <View style={styles.hint}>
        <MaterialCommunityIcons
          name="account-search-outline"
          size={40}
          color="#A5B4FC"
        />
        <Text style={styles.hintText}>Nhập @username hoặc tên để tìm bạn bè</Text>
      </View>
    );
  }

  const Empty = !isSearching ? (
    <View style={styles.empty}>
      <View style={styles.emptyIconWrap}>
        <MaterialCommunityIcons
          name="account-search-outline"
          size={34}
          color="#4F46E5"
        />
        <View style={styles.qBadge}>
          <Text style={styles.qText}>?</Text>
        </View>
      </View>
      <Text style={styles.emptyTitle}>Không tìm thấy người dùng phù hợp</Text>
      <Text style={styles.emptyDesc}>
        Hãy kiểm tra lại chính tả username bắt đầu bằng @ hoặc tên đầy đủ của người
        dùng.
      </Text>
    </View>
  ) : null;

  return (
    <FlatList
      data={users}
      keyExtractor={(u) => u._id}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      // Khoảng cách giữa các card
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      ListHeaderComponent={
        <>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Đang lọc theo:</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>
                {byUsername ? "Khớp username" : "Tên hoặc username"}
              </Text>
              <View style={styles.chipDot} />
            </View>
            <Text style={styles.count}>{total} kết quả tìm thấy</Text>
          </View>

          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Kết quả tìm kiếm</Text>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <UserSearchResultCard
          user={item}
          receivedCreatedAt={
            item.requestId ? receivedTime.get(String(item.requestId)) : undefined
          }
          onMessage={onMessage}
        />
      )}
      ListEmptyComponent={
        isError ? (
          <Text style={styles.errorText}>Không thể tìm kiếm, vui lòng thử lại.</Text>
        ) : (
          Empty
        )
      }
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 24,
      }}
    />
  );
}

const styles = StyleSheet.create({
  hint: { alignItems: "center", paddingTop: 60, gap: 10 },
  hintText: { fontSize: 13, color: "#9CA3AF" },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  filterLabel: { fontSize: 11, color: "#6B7280" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E0E0FB",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: { fontSize: 11, fontWeight: "600", color: "#3730A3" },
  chipDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#3730A3" },
  count: { marginLeft: "auto", fontSize: 11, color: "#6B7280" },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 10,
  },
  resultTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },

  empty: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 12,
    backgroundColor: "#F8F8FC",
    borderRadius: 16,
  },
  emptyIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#E0E0FB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  qBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#3B2FC9",
    alignItems: "center",
    justifyContent: "center",
  },
  qText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 12.5,
    color: "#4B5563",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },

  errorText: {
    textAlign: "center",
    color: "#DC2626",
    fontSize: 13,
    paddingVertical: 20,
  },
});
