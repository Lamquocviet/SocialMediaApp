import React, { useMemo, useState } from "react";

import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
} from "react-native";

import { useMe } from "@/hooks/useMe";
import type { Conversation } from "@/types/chat";
import ConversationItem from "@/components/ConversationItem";
import { SafeAreaView } from "react-native-safe-area-context";
import UserSearchResults from "@/components/UserSearchResults";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useConversations, useCreateConversation } from "@/hooks/useChat";
import type { SearchUser } from "@/hooks/useUserSearch";

type ChatTab = "all" | "direct" | "group";

export default function ChatListScreen() {
  const { data: me } = useMe();
  const router = useRouter();
  const createConversation = useCreateConversation();

  const currentUserId = me?._id;

  const [activeTab, setActiveTab] = useState<ChatTab>("all");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [opening, setOpening] = useState(false);

  const isSearching = searchFocused || search.trim().length > 0;

  const { data, isLoading, isError, refetch, isRefetching } = useConversations();

  const conversations = data?.conversations ?? [];

  // Open chat with user
  const openChatWith = async (user: SearchUser) => {
    if (opening) return;

    setOpening(true);

    try {
      let conversationId = conversations.find(
        (c) =>
          c.type === "direct" &&
          c.participants.some((p) => String(p._id) === String(user._id)),
      )?._id;

      if (!conversationId) {
        const created = await createConversation.mutateAsync({
          type: "direct",
          memberIds: [user._id],
        });

        conversationId = created._id;
      }

      setSearch("");
      setSearchFocused(false);
      Keyboard.dismiss();

      router.push({
        pathname: "/chat/[id]",
        params: {
          id: conversationId,
          type: "direct",
          name: user.displayName,
          avatar: user.avatarUrl ?? "",
          recipientId: user._id,
        },
      } as any);
    } catch (e) {
      // TODO: Show error toast
    } finally {
      setOpening(false);
    }
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(
      (convo) => activeTab === "all" || convo.type === activeTab,
    );
  }, [conversations, activeTab]);

  // Loading
  if (isLoading || !currentUserId) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text className="mt-3 text-sm text-gray-500">
          Đang tải cuộc trò chuyện...
        </Text>
      </View>
    );
  }

  // Error
  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-center text-sm text-red-600">
          Không thể tải danh sách cuộc trò chuyện.
        </Text>

        <Pressable
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 active:bg-blue-700"
          onPress={() => refetch()}
        >
          <Text className="font-semibold text-white">Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  // Header
  const Header = (
    <View className="px-4 pb-3 pt-4">
      {!isSearching && (
        <Text className="mb-4 text-2xl font-bold text-gray-900">Tin nhắn</Text>
      )}

      {/* Search */}
      <View className="flex-row items-center gap-3">
        <View className="h-11 flex-1 flex-row items-center gap-2 rounded-xl bg-gray-100 px-3">
          <Ionicons
            name="search"
            size={18}
            color="#9CA3AF"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            placeholder="Tìm kiếm bạn bè, @username..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            className="flex-1 py-0 text-sm text-gray-900"
          />

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch("")}
              hitSlop={10}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color="#9CA3AF"
              />
            </Pressable>
          )}
        </View>

        {isSearching && (
          <Pressable
            onPress={() => {
              setSearch("");
              setSearchFocused(false);
              Keyboard.dismiss();
            }}
            hitSlop={8}
          >
            <Text className="text-sm font-semibold text-blue-600">Hủy</Text>
          </Pressable>
        )}
      </View>

      {/* Tabs */}
      {!isSearching && (
        <View className="mt-4 flex-row gap-2">
          {(
            [
              { key: "all", label: "Tất cả" },
              { key: "direct", label: "Cá nhân" },
              { key: "group", label: "Nhóm" },
            ] as { key: ChatTab; label: string }[]
          ).map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-[9px] ${
                  isActive ? "bg-blue-600" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-[13px] font-medium ${
                    isActive ? "text-white" : "text-gray-600"
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );

  // Empty list
  const EmptyList = (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Text className="text-[15px] font-semibold text-gray-700">
        Không tìm thấy cuộc trò chuyện
      </Text>

      <Text className="mt-2 text-center text-[13px] text-gray-400">
        Thử thay đổi từ khóa tìm kiếm hoặc chọn tab khác.
      </Text>
    </View>
  );

  // Render conversation
  const renderConversation = ({ item }: { item: Conversation }) => {
    return (
      <View className="mx-[5px] my-[2px] overflow-hidden">
        <ConversationItem
          conversation={item}
          currentUserId={currentUserId ?? ""}
        />
      </View>
    );
  };

  // Main UI
  return (
    <SafeAreaView className="flex-1 bg-white">
      {Header}

      {isSearching ? (
        <UserSearchResults
          query={search}
          onMessage={openChatWith}
        />
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item._id}
          renderItem={renderConversation}
          ListEmptyComponent={EmptyList}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={["#2563EB"]}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            filteredConversations.length === 0 ? { flexGrow: 1 } : undefined
          }
        />
      )}
    </SafeAreaView>
  );
}
