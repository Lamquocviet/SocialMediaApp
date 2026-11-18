import EditProfileModal from "@/components/EditProfileModal";
import PostsList from "@/components/PostsList";
import SignOutButton from "@/components/SignOutButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { useProfile } from "@/hooks/useProfile";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import UserAvatar from "@/components/UserAvatar";

const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop";

const ProfileScreens = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const insets = useSafeAreaInsets();

  const {
    posts: userPosts,
    refetch: refetchPosts,
    isLoading: isRefetching,
  } = usePosts(currentUser?.username);

  const {
    isEditModalVisible,
    openEditModal,
    closeEditModal,
    formData,
    saveProfile,
    updateFormField,
    isUpdating,
    uploadProfileImage,
    refetch: refetchProfile,
  } = useProfile();

  const pickImage = async (imageType: "avatar" | "banner") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Yêu cầu quyền truy cập",
        "Vui lòng cho phép truy cập thư viện ảnh để cập nhật hình ảnh.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: imageType === "avatar" ? [1, 1] : [2, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const ext = asset.uri.split(".").pop()?.toLowerCase() || "jpg";

    uploadProfileImage(
      {
        uri: asset.uri,
        name: `${imageType}-${Date.now()}.${ext}`,
        type: asset.mimeType || `image/${ext === "jpg" ? "jpeg" : ext}`,
      },
      imageType,
    );
  };

  if (isLoading || !currentUser) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator
          size="large"
          color="#1DA1F2"
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["top"]}
    >
      {/* Thanh tiêu đề */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View>
          <Text className="text-xl font-bold text-gray-900">
            {currentUser.displayName}
          </Text>
          <Text className="text-gray-500 text-sm">{userPosts.length} bài viết</Text>
        </View>
        <SignOutButton />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetchProfile();
              refetchPosts();
            }}
            tintColor="#1DA1F2"
          />
        }
      >
        {/* Ảnh bìa */}
        <View>
          <Image
            source={{ uri: currentUser.bannerImage || DEFAULT_BANNER }}
            className="w-full h-48"
            resizeMode="cover"
          />
          <TouchableOpacity
            className="absolute right-3 bottom-3 bg-black/60 w-10 h-10 rounded-full items-center justify-center"
            onPress={() => pickImage("banner")}
            disabled={isUpdating}
            activeOpacity={0.8}
          >
            <Feather
              name="camera"
              size={18}
              color="white"
            />
          </TouchableOpacity>
        </View>

        <View className="px-4 pb-4 border-b border-gray-100">
          <View className="flex-row justify-between items-end -mt-16 mb-4">
            {/* Ảnh đại diện */}
            <View>
              <View className="border-4 border-white rounded-full">
                <UserAvatar
                  displayName={currentUser.displayName}
                  profilePicture={currentUser.profilePicture}
                  size={120}
                />
              </View>
              <TouchableOpacity
                className="absolute right-0 bottom-0 bg-[#3B2FD0] w-9 h-9 rounded-full items-center justify-center border-2 border-white"
                onPress={() => pickImage("avatar")}
                disabled={isUpdating}
                activeOpacity={0.8}
              >
                <Feather
                  name="camera"
                  size={16}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="border border-gray-300 px-6 py-2 rounded-full"
              onPress={openEditModal}
            >
              <Text className="font-semibold text-gray-900">Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <Text className="text-xl font-bold text-gray-900 mr-1">
                {currentUser.displayName}
              </Text>
              <Feather
                name="check-circle"
                size={20}
                color="#1DA1F2"
              />
            </View>

            <Text className="text-gray-500 mb-2">@{currentUser.username}</Text>

            <Text className="text-gray-900 mb-3">{currentUser.bio}</Text>

            <View className="flex-row items-center mb-2">
              <Feather
                name="map-pin"
                size={16}
                color="#657786"
              />
              <Text className="text-gray-500 ml-2">{currentUser.location}</Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Feather
                name="calendar"
                size={16}
                color="#657786"
              />
              <Text className="text-gray-500 ml-2">
                Tham gia từ {format(new Date(currentUser.createdAt), "MM/yyyy")}
              </Text>
            </View>

            <View className="flex-row">
              <TouchableOpacity className="mr-6">
                <Text className="text-gray-900">
                  <Text className="font-bold">{currentUser.following?.length}</Text>
                  <Text className="text-gray-500"> Đang theo dõi</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text className="text-gray-900">
                  <Text className="font-bold">{currentUser.followers?.length}</Text>
                  <Text className="text-gray-500"> Người theo dõi</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <PostsList username={currentUser?.username} />
      </ScrollView>

      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={closeEditModal}
        formData={formData}
        saveProfile={saveProfile}
        updateFormField={updateFormField}
        isUpdating={isUpdating}
      />

      {/* Hiển thị trạng thái tải khi đang tải ảnh lên */}
      {isUpdating && !isEditModalVisible && (
        <View className="absolute inset-0 bg-black/30 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#fff"
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ProfileScreens;
