import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, saveAuthToken } from "@/utils/api";
import AuthInput from "@/components/auth/AuthInput";

export default function LoginScreen() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    const name = username.trim().toLowerCase();

    if (!name || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.signIn({ username: name, password });
      queryClient.clear();
      await saveAuthToken(res.data.accessToken);
      router.replace("/(tabs)");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.code === "ERR_NETWORK"
          ? "Không kết nối được máy chủ."
          : "Đăng nhập thất bại, vui lòng thử lại.");
      Alert.alert("Đăng nhập thất bại", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f7f7f5" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-5 pb-8 pt-10">
          <View className="mb-6 items-center">
            <Image
              source={require("../../assets/images/auth2.png")}
              style={{ width: 208, height: 208 }}
              resizeMode="contain"
            />
          </View>

          <View className="rounded-[28px] bg-white p-5">
            <Text className="text-3xl font-bold text-[#111827]">
              Chào mừng bạn trở lại
            </Text>
            <Text className="mb-5 mt-2 text-sm text-gray-500">
              Đăng nhập để tiếp tục sử dụng tài khoản của bạn.
            </Text>

            <AuthInput
              label="Tên đăng nhập"
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              autoCorrect={false}
            />

            <AuthInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              isPassword
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
            />

            <TouchableOpacity
              className="mt-2 items-center rounded-2xl bg-[#111827] py-4"
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-white">Đăng nhập</Text>
              )}
            </TouchableOpacity>

            <View className="mt-5 flex-row items-center justify-center">
              <Text className="text-sm text-gray-500">Chưa có tài khoản? </Text>
              <Pressable onPress={() => router.replace("/(auth)/signup" as any)}>
                <Text className="text-sm font-semibold text-[#2563eb]">Đăng ký</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
