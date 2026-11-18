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

export default function SignUpScreen() {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!displayName.trim() || !username.trim() || !email.trim() || !password) {
      return "Vui lòng điền đầy đủ thông tin.";
    }
    if (!/^[a-z0-9_.]{3,20}$/.test(username.trim().toLowerCase())) {
      return "Tên đăng nhập 3-20 ký tự: chữ, số, dấu _ hoặc .";
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return "Email không hợp lệ.";
    }
    if (password.length < 6) {
      return "Mật khẩu cần ít nhất 6 ký tự.";
    }
    return null;
  };

  const handleSignUp = async () => {
    const error = validate();
    if (error) {
      Alert.alert("Thông tin chưa hợp lệ", error);
      return;
    }

    const name = username.trim().toLowerCase();
    setLoading(true);

    try {
      await authApi.signUp({
        username: name,
        password,
        email: email.trim(),
        displayName: displayName.trim(),
      });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.code === "ERR_NETWORK"
          ? "Không kết nối được máy chủ."
          : "Đăng ký thất bại, vui lòng thử lại.");
      Alert.alert("Đăng ký thất bại", message);
      setLoading(false);
      return;
    }

    // Tài khoản đã tạo xong, tự đăng nhập; lỗi ở bước này không được báo là "đăng ký thất bại"
    try {
      const res = await authApi.signIn({ username: name, password });
      queryClient.clear();
      await saveAuthToken(res.data.accessToken);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Đăng ký thành công", "Vui lòng đăng nhập để tiếp tục.");
      router.replace("/(auth)/login" as any);
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
              style={{ width: 160, height: 160 }}
              resizeMode="contain"
            />
          </View>

          <View className="rounded-[28px] bg-white p-5">
            <Text className="text-3xl font-bold text-[#111827]">Tạo tài khoản</Text>
            <Text className="mb-5 mt-2 text-sm text-gray-500">
              Bắt đầu hành trình của bạn với một tài khoản mới.
            </Text>

            <AuthInput
              label="Tên hiển thị"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Nguyễn Văn A"
              autoCapitalize="words"
            />

            <AuthInput
              label="Tên đăng nhập"
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              autoCorrect={false}
            />

            <AuthInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <AuthInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              placeholder="Ít nhất 6 ký tự"
              isPassword
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
            />

            <TouchableOpacity
              className="mt-2 items-center rounded-2xl bg-[#111827] py-4"
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  Tạo tài khoản
                </Text>
              )}
            </TouchableOpacity>

            <View className="mt-5 flex-row items-center justify-center">
              <Text className="text-sm text-gray-500">Đã có tài khoản? </Text>
              <Pressable onPress={() => router.replace("/(auth)/login" as any)}>
                <Text className="text-sm font-semibold text-[#2563eb]">
                  Đăng nhập
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
