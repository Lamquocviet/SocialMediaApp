import React, { useMemo } from "react";
import { View, Text, FlatList } from "react-native";
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

  // Chưa nhập nội dung tìm kiếm
  if (!hasQuery) {
    return (
      <View className="items-center gap-[10px] pt-[60px]">
        <MaterialCommunityIcons
          name="account-search-outline"
          size={40}
          color="#A5B4FC"
        />

        <Text className="text-[13px] text-gray-400">
          Nhập @username hoặc tên để tìm bạn bè
        </Text>
      </View>
    );
  }

  // Không tìm thấy kết quả
  const Empty = !isSearching ? (
    <View className="items-center rounded-2xl bg-[#F8F8FC] px-3 py-6">
      <View className="relative mb-[14px] h-[76px] w-[76px] items-center justify-center rounded-full bg-[#E0E0FB]">
        <MaterialCommunityIcons
          name="account-search-outline"
          size={34}
          color="#4F46E5"
        />

        <View className="absolute -right-0.5 -top-0.5 h-[22px] w-[22px] items-center justify-center rounded-full bg-[#3B2FC9]">
          <Text className="text-xs font-bold text-white">?</Text>
        </View>
      </View>

      <Text className="text-center text-base font-bold text-gray-800">
        Không tìm thấy người dùng phù hợp
      </Text>

      <Text className="mt-2 text-center text-[12.5px] leading-[18px] text-gray-600">
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
      ItemSeparatorComponent={() => <View className="h-3" />}
      ListHeaderComponent={
        <>
          {/* Filter information */}
          <View className="mt-1 flex-row items-center gap-[6px]">
            <Text className="text-[11px] text-gray-500">Đang lọc theo:</Text>

            <View className="flex-row items-center gap-1 rounded-lg bg-[#E0E0FB] px-2 py-[3px]">
              <Text className="text-[11px] font-semibold text-indigo-800">
                {byUsername ? "Khớp username" : "Tên hoặc username"}
              </Text>

              <View className="h-[5px] w-[5px] rounded-full bg-indigo-800" />
            </View>

            <Text className="ml-auto text-[11px] text-gray-500">
              {total} kết quả tìm thấy
            </Text>
          </View>

          {/* Result heading */}
          <View className="mb-[10px] mt-[14px] flex-row items-center justify-between">
            <Text className="text-sm font-bold text-gray-900">Kết quả tìm kiếm</Text>
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
          <Text className="py-5 text-center text-[13px] text-red-600">
            Không thể tìm kiếm, vui lòng thử lại.
          </Text>
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
