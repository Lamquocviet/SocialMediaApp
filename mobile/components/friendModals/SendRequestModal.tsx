import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MAX_LENGTH = 150;

type Props = {
  visible: boolean;
  displayName: string;
  username: string;
  loading: boolean;
  onCancel: () => void;
  onSend: (message: string) => void;
};

export default function SendRequestModal({
  visible,
  displayName,
  username,
  loading,
  onCancel,
  onSend,
}: Props) {
  const [message, setMessage] = useState("");

  // Mỗi lần mở popup: điền sẵn lời nhắn gợi ý
  useEffect(() => {
    if (visible) setMessage(`Chào ${displayName}, mình muốn kết nối với bạn nhé!`);
  }, [visible, displayName]);

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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          {/* Bấm ra ngoài để đóng */}
          <Pressable
            className="absolute inset-0"
            onPress={close}
          />

          <View className="w-full max-w-[360px] rounded-3xl bg-white p-5">
            <View className="items-center">
              <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-[#E0E0FB]">
                <Ionicons
                  name="person-add"
                  size={24}
                  color="#3B2FC9"
                />
              </View>
              <Text className="text-lg font-bold text-gray-900">
                Gửi lời mời kết bạn
              </Text>
              <Text className="mt-1 text-center text-[13px] text-gray-500">
                Gửi tới{" "}
                <Text className="font-bold text-gray-800">{displayName}</Text> (@
                {username})
              </Text>
            </View>

            <Text className="mb-1.5 mt-4 text-[13px] font-semibold text-gray-700">
              Lời nhắn (không bắt buộc)
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Viết vài lời để làm quen..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={MAX_LENGTH}
              editable={!loading}
              textAlignVertical="top"
              className="min-h-[96px] rounded-xl border border-[#D6D1FA] bg-[#F4F2FF] px-3 py-2.5 text-[14px] text-gray-900"
            />
            <Text className="mt-1 self-end text-[11px] text-gray-400">
              {message.length}/{MAX_LENGTH}
            </Text>

            <View className="mt-4 flex-row gap-2.5">
              <Pressable
                className="h-12 flex-1 items-center justify-center rounded-2xl bg-[#E8EAFB] active:opacity-80"
                disabled={loading}
                onPress={onCancel}
              >
                <Text className="text-[15px] font-bold text-gray-700">Hủy</Text>
              </Pressable>

              <Pressable
                className="h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl bg-[#3B2FC9] active:opacity-80"
                disabled={loading}
                onPress={() => onSend(message.trim())}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="paper-plane"
                      size={16}
                      color="#fff"
                    />
                    <Text className="text-[15px] font-bold text-white">Gửi</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
