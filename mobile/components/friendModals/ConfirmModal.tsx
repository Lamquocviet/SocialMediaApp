import React, { ReactNode } from "react";
import { Modal, View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  title: string;
  description: ReactNode;
  confirmText: string;
  cancelText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  visible,
  title,
  description,
  confirmText,
  cancelText = "Hủy",
  icon = "person-remove-outline",
  loading = false,
  onCancel,
  onConfirm,
}: Props) {
  const close = () => {
    if (!loading) onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <Pressable
          className="absolute inset-0"
          onPress={close}
        />

        <View className="w-full max-w-[340px] items-center rounded-3xl bg-white p-5">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <Ionicons
              name={icon}
              size={26}
              color="#DC2626"
            />
          </View>

          <Text className="text-lg font-bold text-gray-900">{title}</Text>
          <Text className="mt-2 text-center text-[14px] leading-[21px] text-gray-600">
            {description}
          </Text>

          <View className="mt-5 flex-row gap-2.5 self-stretch">
            <Pressable
              className="h-12 flex-1 items-center justify-center rounded-2xl bg-[#E8EAFB] active:opacity-80"
              disabled={loading}
              onPress={onCancel}
            >
              <Text className="text-[15px] font-bold text-gray-700">
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              className="h-12 flex-1 items-center justify-center rounded-2xl bg-red-600 active:opacity-80"
              disabled={loading}
              onPress={onConfirm}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                />
              ) : (
                <Text className="text-[15px] font-bold text-white">
                  {confirmText}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
