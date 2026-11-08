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
} from "react-native";

import { useConversations } from "@/hooks/useChat";

import type { Conversation, ConversationType } from "@/types/chat";

import DirectMessage from "@/components/chatComponent/DirectMessage";
import GroupMessage from "@/components/chatComponent/GroupMessage";
import ConversationItem from "@/components/ConversationItem";
import { SafeAreaView } from "react-native-safe-area-context";

// ========================================
// TYPES
// ========================================

type ChatTab = "all" | "direct" | "group";

interface ChatListScreenProps {
  currentUserId: string;
}

// ========================================
// COMPONENT
// ========================================

export default function ChatListScreen({ currentUserId }: ChatListScreenProps) {
  const [activeTab, setActiveTab] = useState<ChatTab>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch, isRefetching } = useConversations();

  // ========================================
  // GET CONVERSATIONS
  // ========================================

  const conversations = data?.conversations ?? [];

  // ========================================
  // FILTER CONVERSATIONS
  // ========================================

  const filteredConversations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return conversations.filter((conversation) => {
      // Filter theo tab
      const matchesTab = activeTab === "all" || conversation.type === activeTab;

      if (!matchesTab) {
        return false;
      }

      // Xác định tên conversation
      let conversationName = "";

      if (conversation.type === "group") {
        conversationName = conversation.group?.name ?? "";
      } else {
        const otherUser = conversation.participants.find(
          (participant) => participant._id !== currentUserId,
        );

        conversationName = otherUser?.displayName ?? "";
      }

      // Filter theo từ khóa
      const matchesSearch = conversationName.toLowerCase().includes(keyword);

      return matchesSearch;
    });
  }, [conversations, activeTab, search, currentUserId]);

  // ========================================
  // RENDER CONVERSATION
  // ========================================

  // const renderConversation = ({ item }: { item: Conversation }) => {
  //   return (
  //     <View style={styles.conversationItem}>
  //       {item.type === "direct" ? (
  //         <DirectMessage
  //           conversation={item}
  //           currentUserId={currentUserId}
  //         />
  //       ) : (
  //         <GroupMessage
  //           conversation={item}
  //           currentUserId={currentUserId}
  //         />
  //       )}
  //     </View>
  //   );
  // };
  const renderConversation = ({ item }: { item: Conversation }) => {
    return (
      <View style={styles.conversationItem}>
        <ConversationItem
          conversation={item}
          currentUserId={currentUserId}
        />
      </View>
    );
  };
  // ========================================
  // LOADING
  // ========================================

  if (isLoading) {
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

  const ListHeader = (
    <View style={styles.header}>
      <Text style={styles.title}>Tin nhắn</Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Tìm kiếm cuộc trò chuyện..."
        placeholderTextColor="#9CA3AF"
        style={styles.searchInput}
      />

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
    </View>
  );

  // ========================================
  // EMPTY STATE
  // ========================================

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
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item._id}
        renderItem={renderConversation}
        ListHeaderComponent={ListHeader}
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

  searchInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F3F4F6",
    color: "#111827",
    fontSize: 14,
  },

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
