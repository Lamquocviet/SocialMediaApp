import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import type { ProfileFormData } from "@/hooks/useProfile";

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  formData: ProfileFormData;
  saveProfile: () => void;
  updateFormField: (field: keyof ProfileFormData, value: string) => void;
  isUpdating: boolean;
}

const EditProfileModal = ({
  formData,
  isUpdating,
  isVisible,
  onClose,
  saveProfile,
  updateFormField,
}: EditProfileModalProps) => {
  const handleSave = () => {
    saveProfile();
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-blue-500 text-lg">Hủy</Text>
        </TouchableOpacity>

        <Text className="text-lg font-semibold">Chỉnh sửa hồ sơ</Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isUpdating}
          className={`${isUpdating ? "opacity-50" : ""}`}
        >
          {isUpdating ? (
            <ActivityIndicator
              size="small"
              color="#1DA1F2"
            />
          ) : (
            <Text className="text-blue-500 text-lg font-semibold">Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-4">
          <View>
            <Text className="text-gray-500 text-sm mb-2">Tên hiển thị</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3 text-base"
              value={formData.displayName}
              onChangeText={(text) => updateFormField("displayName", text)}
              placeholder="Nhập tên hiển thị của bạn"
            />
          </View>

          <View>
            <Text className="text-gray-500 text-sm mb-2">Giới thiệu</Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-3 py-3 text-base"
              value={formData.bio}
              onChangeText={(text) => updateFormField("bio", text)}
              placeholder="Hãy giới thiệu đôi chút về bản thân"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View>
            <Text className="text-gray-500 text-sm mb-2">Địa điểm</Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-3 py-3 text-base"
              value={formData.location}
              onChangeText={(text) => updateFormField("location", text)}
              placeholder="Nhập địa điểm của bạn"
            />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default EditProfileModal;
