import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import type { AxiosError } from "axios";

import UserAvatar from "@/components/UserAvatar";
import { useFriendsList, type FriendUser } from "@/hooks/useFriend";
import { useCreateConversation } from "@/hooks/useChat";

const PRIMARY = "#3B2FC9";
const MIN_MEMBERS = 2; // chưa tính người tạo

type PickedImage = { uri: string; name: string; type: string };

export default function CreateGroupScreen() {
  const router = useRouter();
  const { data: friends = [], isLoading } = useFriendsList();
  const createGroup = useCreateConversation();

  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<PickedImage | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase().replace(/^@/, "");
    if (!q) return friends;
    return friends.filter(
      (f) =>
        f.displayName.toLowerCase().includes(q) ||
        f.username.toLowerCase().includes(q),
    );
  }, [friends, search]);

  const selectedUsers = useMemo(
    () =>
      selectedIds
        .map((id) => friends.find((f) => f._id === id))
        .filter(Boolean) as FriendUser[],
    [selectedIds, friends],
  );

  const toggle = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const canCreate =
    name.trim().length > 0 &&
    selectedIds.length >= MIN_MEMBERS &&
    !createGroup.isPending;

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Cần quyền truy cập",
        "Hãy cho phép truy cập ảnh để đặt ảnh nhóm.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const ext = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
    setAvatar({
      uri: asset.uri,
      name: `group-${Date.now()}.${ext}`,
      type: asset.mimeType || `image/${ext === "jpg" ? "jpeg" : ext}`,
    });
  };

  const handleCreate = () => {
    if (!canCreate) return;

    createGroup.mutate(
      {
        name: name.trim(),
        memberIds: selectedIds,
        avatar: avatar ?? undefined,
      },
      {
        onSuccess: (conversation) => {
          router.replace({
            pathname: "/chat/[id]",
            params: {
              id: conversation._id,
              type: "group",
              name: conversation.group?.name ?? name.trim(),
              avatar: conversation.group?.avatarUrl ?? "",
            },
          } as any);
        },
        onError: (err) => {
          const message =
            (err as AxiosError<{ message?: string }>)?.response?.data?.message ??
            "Không thể tạo nhóm, vui lòng thử lại.";
          Alert.alert("Lỗi", message);
        },
      },
    );
  };

  const renderFriend = ({ item }: { item: FriendUser }) => {
    const selected = selectedIds.includes(item._id);

    return (
      <Pressable
        onPress={() => toggle(item._id)}
        className="flex-row items-center px-4 py-3 active:bg-[#F4F2FF]"
      >
        <UserAvatar
          displayName={item.displayName}
          profilePicture={item.profilePicture}
          size={48}
        />

        <View className="ml-3 min-w-0 flex-1">
          <Text
            className="text-[15px] font-bold text-gray-900"
            numberOfLines={1}
          >
            {item.displayName}
          </Text>
          <Text
            className="text-xs text-gray-500"
            numberOfLines={1}
          >
            @{item.username}
          </Text>
        </View>

        <View
          className={`h-6 w-6 items-center justify-center rounded-full ${
            selected ? "bg-[#3B2FC9]" : "bg-[#E0E0FB]"
          }`}
        >
          {selected && (
            <Ionicons
              name="checkmark"
              size={16}
              color="#fff"
            />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4F2FF]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="flex-row items-center"
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={PRIMARY}
          />
          <Text className="text-[15px] font-semibold text-[#3B2FC9]">Quay lại</Text>
        </Pressable>

        <Text className="text-lg font-bold text-gray-900">Tạo Nhóm Mới</Text>

        <Pressable
          onPress={handleCreate}
          disabled={!canCreate}
          className={`rounded-xl px-5 py-2.5 ${
            canCreate ? "bg-[#3B2FC9]" : "bg-[#B9B4F0]"
          }`}
        >
          {createGroup.isPending ? (
            <ActivityIndicator
              size="small"
              color="#fff"
            />
          ) : (
            <Text className="font-bold text-white">Tạo</Text>
          )}
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(f) => f._id}
        renderItem={renderFriend}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        ListHeaderComponent={
          <View className="px-4">
            {/* Ảnh + tên nhóm */}
            <View className="mt-2 flex-row items-center rounded-2xl bg-white p-4">
              <Pressable
                onPress={pickAvatar}
                className="mr-4"
              >
                {avatar ? (
                  <Image
                    source={{ uri: avatar.uri }}
                    className="h-[72px] w-[72px] rounded-full"
                  />
                ) : (
                  <View className="h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-dashed border-[#B9B4F0] bg-[#F4F2FF]">
                    <Ionicons
                      name="camera-outline"
                      size={24}
                      color={PRIMARY}
                    />
                    <Text className="text-[10px] text-[#3B2FC9]">Đặt ảnh</Text>
                  </View>
                )}
                <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full bg-[#3B2FC9]">
                  <Ionicons
                    name="add"
                    size={16}
                    color="#fff"
                  />
                </View>
              </Pressable>

              <View className="flex-1">
                <Text className="mb-1 text-xs font-semibold text-gray-700">
                  Tên nhóm <Text className="text-red-600">*</Text>
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  maxLength={50}
                  placeholder="VD: Team Design System"
                  placeholderTextColor="#B8B5D6"
                  className="h-10 rounded-full bg-[#F4F2FF] px-3 text-sm text-gray-900"
                />
              </View>
            </View>

            {/* Tìm bạn */}
            <View className="mt-4 h-11 flex-row items-center gap-2 rounded-xl bg-white px-3">
              <Ionicons
                name="search"
                size={18}
                color="#9CA3AF"
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Tìm tên hoặc @username bạn bè..."
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 py-0 text-sm text-gray-900"
              />
            </View>

            {/* Đã chọn */}
            {selectedUsers.length > 0 && (
              <View className="mt-4">
                <Text className="mb-2 text-xs font-bold text-gray-700">Đã chọn</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {selectedUsers.map((u) => (
                    <View
                      key={u._id}
                      className="mr-3 w-16 items-center"
                    >
                      <View>
                        <UserAvatar
                          displayName={u.displayName}
                          profilePicture={u.profilePicture}
                          size={56}
                        />
                        <Pressable
                          onPress={() => toggle(u._id)}
                          hitSlop={6}
                          className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-gray-800"
                        >
                          <Ionicons
                            name="close"
                            size={12}
                            color="#fff"
                          />
                        </Pressable>
                      </View>
                      <Text
                        className="mt-1 text-[11px] font-medium text-gray-800"
                        numberOfLines={1}
                      >
                        {u.displayName}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text className="mb-2 mt-5 text-xs font-bold tracking-wide text-gray-500">
              TẤT CẢ BẠN BÈ
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              className="mt-6"
              color={PRIMARY}
            />
          ) : (
            <Text className="mt-6 text-center text-sm text-gray-500">
              {search ? "Không tìm thấy bạn bè phù hợp." : "Bạn chưa có bạn bè nào."}
            </Text>
          )
        }
      />

      {/* Nút dưới cùng */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#F4F2FF] px-4 pb-6 pt-3">
        <Pressable
          onPress={handleCreate}
          disabled={!canCreate}
          className={`h-12 flex-row items-center justify-center gap-2 rounded-xl ${
            canCreate ? "bg-[#4F46E5]" : "bg-[#B9B4F0]"
          }`}
        >
          <Ionicons
            name="people"
            size={18}
            color="#fff"
          />
          <Text className="font-bold text-white">
            Tạo nhóm trò chuyện ({selectedIds.length + 1} thành viên)
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
