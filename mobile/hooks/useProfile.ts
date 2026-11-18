import { useState } from "react";
import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, userApi } from "../utils/api";
import { useCurrentUser } from "./useCurrentUser";

export type ProfileFormData = {
  displayName: string;
  bio: string;
  location: string;
};

type UpdateProfileData = {
  displayName?: string;
  bio?: string;
  location?: string;
  image?: {
    uri: string;
    name: string;
    type: string;
  };
  imageType?: "avatar" | "banner";
};

export const useProfile = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: "",
    bio: "",
    location: "",
  });

  const { currentUser } = useCurrentUser();

  // Mutation cập nhật profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const form = new FormData();

      if (data.displayName !== undefined) {
        form.append("displayName", data.displayName);
      }

      if (data.bio !== undefined) {
        form.append("bio", data.bio);
      }

      if (data.location !== undefined) {
        form.append("location", data.location);
      }

      if (data.image && data.imageType) {
        form.append("imageType", data.imageType);

        form.append("image", {
          uri: data.image.uri,
          name: data.image.name,
          type: data.image.type,
        } as any);
      }

      const response = await userApi.updateProfile(api, form);

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });

      setIsEditModalVisible(false);

      Alert.alert("Success", "Profile updated successfully!");
    },

    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to update profile",
      );
    },
  });

  // Mở modal chỉnh sửa
  const openEditModal = () => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
      });
    }

    setIsEditModalVisible(true);
  };

  // Cập nhật từng field
  const updateFormField = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Cập nhật thông tin cá nhân
  const saveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  // Upload avatar hoặc banner
  const uploadProfileImage = (
    image: UpdateProfileData["image"],
    imageType: "avatar" | "banner",
  ) => {
    if (!image) return;

    updateProfileMutation.mutate({
      image,
      imageType,
    });
  };

  return {
    isEditModalVisible,
    formData,

    openEditModal,
    closeEditModal: () => setIsEditModalVisible(false),

    updateFormField,
    saveProfile,

    uploadProfileImage,

    isUpdating: updateProfileMutation.isPending,

    refetch: () =>
      queryClient.invalidateQueries({
        queryKey: ["authUser"],
      }),
  };
};
