import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DirectMessage from "@/components/chatComponent/DirectMessage";
import GroupMessage from "@/components/chatComponent/GroupMessage";
import ActiveUserItem from "@/components/chatComponent/ActiveUserItem";
import { useRouter } from "expo-router";

type ActiveUser = {
  id: string;
  name: string;
  avatar?: string;
  isMe?: boolean;
  ring?: boolean;
  online?: boolean;
};

const COLORS = {
  primary: "#5B4BDB",
  primarySoft: "#EEEBFF",
  bg: "#F4F5FA",
  card: "#FFFFFF",
  text: "#1B1B2F",
  sub: "#6B7280",
  border: "#E5E7EB",
  online: "#22C55E",
};

const ACTIVE_USERS: ActiveUser[] = [
  { id: "me", name: "Bạn", isMe: true },
  {
    id: "1",
    name: "Lan Anh",
    avatar: "https://i.pravatar.cc/150?img=47",
    ring: true,
    online: true,
  },
  {
    id: "2",
    name: "Quốc Bảo",
    avatar: "https://i.pravatar.cc/150?img=12",
    online: true,
  },
  {
    id: "3",
    name: "Thảo My",
    avatar: "https://i.pravatar.cc/150?img=32",
    online: true,
  },
  {
    id: "4",
    name: "Tuấn Kiệt",
    avatar: "https://i.pravatar.cc/150?img=15",
    online: true,
  },
];
const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "direct", label: "Cá nhân" },
  { key: "group", label: "Nhóm" },
];

export default function ChatListScreen() {
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const router = useRouter();

  const Header = (
    <View>
      {/* Đang hoạt động */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>Đang hoạt động</Text>
          <View style={styles.titleDot} />
        </View>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.activeList}
      >
        {ACTIVE_USERS.map((u) => (
          <ActiveUserItem
            key={u.id}
            user={u}
            onPress={() => {
              if (u.isMe) return;

              router.push({
                pathname: "/chat/[id]",
                params: {
                  id: u.id,
                  type: "direct",
                  name: u.name,
                  avatar: u.avatar ?? "",
                },
              });
            }}
          />
        ))}
      </ScrollView>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons
          name="search"
          size={18}
          color={COLORS.sub}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm kiếm người dùng, cuộc trò chuyện..."
          placeholderTextColor={COLORS.sub}
          style={styles.searchInput}
        />
        <TouchableOpacity>
          <Ionicons
            name="options-outline"
            size={20}
            color={COLORS.sub}
          />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabList}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabChip, active && styles.tabChipActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
    >
      <View style={styles.container}>
        {Header}

        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {activeTab === "all" && (
              <>
                <Text style={styles.listTitle}>Tất cả</Text>

                <View style={styles.listSection}>
                  <View style={styles.listHeader}>
                    <Text style={styles.listSectionTitle}>Tin nhắn cá nhân</Text>
                    <Text style={styles.countBadge}>2 cuộc trò chuyện</Text>
                  </View>

                  <DirectMessage />
                </View>

                <View style={styles.listSection}>
                  <View style={styles.listHeader}>
                    <Text style={styles.listSectionTitle}>Tin nhắn nhóm</Text>
                    <Text style={styles.countBadge}>3 nhóm</Text>
                  </View>

                  <GroupMessage />
                </View>
              </>
            )}

            {activeTab === "direct" && (
              <>
                <Text style={styles.listTitle}>Tin nhắn cá nhân</Text>
                <DirectMessage />
              </>
            )}

            {activeTab === "group" && (
              <>
                <Text style={styles.listTitle}>Tin nhắn nhóm</Text>
                <GroupMessage />
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Styles

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },

  /* Section header */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionTitleWrap: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  titleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.online,
    marginLeft: 6,
  },
  seeAll: { fontSize: 12, fontWeight: "600", color: COLORS.primary },

  /* Active users */
  activeList: { paddingHorizontal: 16, paddingVertical: 12, gap: 14 },

  /* Search */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, marginHorizontal: 8, fontSize: 13, color: COLORS.text },

  /* Tabs */
  tabList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },

  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
  },

  tabChipActive: {
    backgroundColor: COLORS.primary,
  },

  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },

  tabTextActive: {
    color: "#FFFFFF",
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  listSection: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 0,
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  listSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },

  countBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
    backgroundColor: "#EEEEEE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
