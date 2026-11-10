import React, { useMemo, useState } from "react";

import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
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

// ========================================
// COMPONENT
// ========================================

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

  const openChatWith = async (user: SearchUser) => {
    if (opening) return; // chặn bấm liên tục
    setOpening(true);

    try {
      // 1. Tìm conversation direct đã có với user này
      let conversationId = conversations.find(
        (c) =>
          c.type === "direct" &&
          c.participants.some((p) => String(p._id) === String(user._id)),
      )?._id;

      // 2. Chưa có thì tạo mới
      if (!conversationId) {
        const created = await createConversation.mutateAsync({
          type: "direct",
          memberIds: [user._id],
        });
        conversationId = created._id;
      }

      // 3. Reset search rồi vào ChatRoom
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
      });
    } catch (e) {
      // TODO: hiện toast "Không thể mở cuộc trò chuyện"
    } finally {
      setOpening(false);
    }
  };
  // ========================================
  // GET CONVERSATIONS
  // ========================================

  const conversations = data?.conversations ?? [];

  // ========================================
  // FILTER CONVERSATIONS
  // ========================================
  const filteredConversations = useMemo(() => {
    return conversations.filter(
      (convo) => activeTab === "all" || convo.type === activeTab,
    );
  }, [conversations, activeTab]);

  // ========================================
  // RENDER CONVERSATION
  // ========================================

  const renderConversation = ({ item }: { item: Conversation }) => {
    return (
      <View style={styles.conversationItem}>
        <ConversationItem
          conversation={item}
          currentUserId={currentUserId ?? ""}
        />
      </View>
    );
  };
  // ========================================
  // LOADING
  // ========================================

  if (isLoading || !currentUserId) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />
        <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
      </View>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Không thể tải danh sách cuộc trò chuyện.
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  // ========================================
  // HEADER
  // ========================================
  const Header = (
    <View style={styles.header}>
      {!isSearching && <Text style={styles.title}>Tin nhắn</Text>}

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
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
            style={styles.searchInput}
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
            <Text style={styles.cancelText}>Hủy</Text>
          </Pressable>
        )}
      </View>

      {!isSearching && (
        <View style={styles.tabs}>
          {(
            [
              { key: "all", label: "Tất cả" },
              { key: "direct", label: "Cá nhân" },
              { key: "group", label: "Nhóm" },
            ] as {
              key: ChatTab;
              label: string;
            }[]
          ).map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tab, isActive && styles.activeTab]}
              >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );

  const EmptyList = (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Không tìm thấy cuộc trò chuyện</Text>

      <Text style={styles.emptyDescription}>
        Thử thay đổi từ khóa tìm kiếm hoặc chọn tab khác.
      </Text>
    </View>
  );

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <SafeAreaView style={styles.container}>
      {Header}
      {isSearching ? (
        <UserSearchResults
          query={search}
          onSuggest={setSearch}
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
            filteredConversations.length === 0 ? styles.emptyListContent : undefined
          }
        />
      )}
    </SafeAreaView>
  );
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  conversationItem: {
    marginHorizontal: 5,
    marginVertical: 2,

    overflow: "hidden",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },

  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2563EB",
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  searchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F3F4F6",
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827", paddingVertical: 0 },
  cancelText: { fontSize: 14, fontWeight: "600", color: "#2563EB" },

  tabs: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
  },

  tab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },

  activeTab: {
    backgroundColor: "#2563EB",
  },

  tabText: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "500",
  },

  activeTabText: {
    color: "#FFFFFF",
  },

  emptyListContent: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  emptyDescription: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
  },
});
