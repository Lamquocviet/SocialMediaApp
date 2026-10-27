import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { authApi, saveAuthToken } from "@/utils/api";

const initialForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
};

export default function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (mode === "signin") {
      if (!form.username.trim() || !form.password.trim()) {
        Alert.alert("Missing fields", "Username and password are required.");
        return;
      }
    } else {
      if (
        !form.firstName.trim() ||
        !form.lastName.trim() ||
        !form.username.trim() ||
        !form.email.trim() ||
        !form.password.trim()
      ) {
        Alert.alert(
          "Missing fields",
          "Please fill in all fields to create an account.",
        );
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        await authApi.signUp({
          username: form.username.trim(),
          password: form.password,
          email: form.email.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
        });

        const loginRes = await authApi.signIn({
          username: form.username.trim(),
          password: form.password,
        });

        const token = loginRes.data.accessToken;
        await saveAuthToken(token);

        Alert.alert("Success", "Account created and signed in successfully.");
        router.replace("/(tabs)");
        return;
      }

      const res = await authApi.signIn({
        username: form.username.trim(),
        password: form.password,
      });

      await saveAuthToken(res.data.accessToken);
      router.replace("/(tabs)");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong. Please try again.";
      Alert.alert("Authentication failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      className="bg-[#f7f7f5]"
    >
      <View className="flex-1 px-5 pb-8 pt-10">
        <View className="items-center mb-6">
          <Image
            source={require("../../assets/images/auth2.png")}
            className="h-52 w-52"
            resizeMode="contain"
          />
        </View>

        <View className="rounded-[28px] bg-white p-5 shadow-sm shadow-black/5">
          <View className="mb-5 rounded-full bg-[#f2f2ef] p-1 flex-row">
            <Pressable
              className={`flex-1 rounded-full py-3 items-center ${
                mode === "signin" ? "bg-white shadow-sm" : "bg-transparent"
              }`}
              onPress={() => setMode("signin")}
            >
              <Text
                className={`font-semibold text-sm ${
                  mode === "signin" ? "text-black" : "text-gray-500"
                }`}
              >
                Sign In
              </Text>
            </Pressable>

            <Pressable
              className={`flex-1 rounded-full py-3 items-center ${
                mode === "signup" ? "bg-white shadow-sm" : "bg-transparent"
              }`}
              onPress={() => setMode("signup")}
            >
              <Text
                className={`font-semibold text-sm ${
                  mode === "signup" ? "text-black" : "text-gray-500"
                }`}
              >
                Sign Up
              </Text>
            </Pressable>
          </View>

          <View className="mb-5">
            <Text className="text-3xl font-bold text-[#111827]">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </Text>
            <Text className="text-sm text-gray-500 mt-2">
              {mode === "signin"
                ? "Sign in to continue to your account."
                : "Start your journey with a new account."}
            </Text>
          </View>

          {mode === "signup" && (
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-2">First name</Text>
                <TextInput
                  value={form.firstName}
                  onChangeText={(text) => updateField("firstName", text)}
                  className="rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-3 text-sm text-gray-800"
                  placeholder="John"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-2">Last name</Text>
                <TextInput
                  value={form.lastName}
                  onChangeText={(text) => updateField("lastName", text)}
                  className="rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-3 text-sm text-gray-800"
                  placeholder="Doe"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          )}

          {mode === "signup" && (
            <View className="mb-3">
              <Text className="text-xs text-gray-500 mb-2">Username</Text>
              <TextInput
                value={form.username}
                onChangeText={(text) => updateField("username", text)}
                className="rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-3 text-sm text-gray-800"
                placeholder="johndoe"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
            </View>
          )}

          {mode === "signin" && (
            <View className="mb-3">
              <Text className="text-xs text-gray-500 mb-2">Username</Text>
              <TextInput
                value={form.username}
                onChangeText={(text) => updateField("username", text)}
                className="rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-3 text-sm text-gray-800"
                placeholder="johndoe"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
            </View>
          )}

          {mode === "signup" && (
            <View className="mb-3">
              <Text className="text-xs text-gray-500 mb-2">Email</Text>
              <TextInput
                value={form.email}
                onChangeText={(text) => updateField("email", text)}
                className="rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-3 text-sm text-gray-800"
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {mode === "signin" && (
            <View className="mb-3 hidden">
              <Text className="text-xs text-gray-500 mb-2">Email</Text>
              <TextInput
                value={form.email}
                onChangeText={(text) => updateField("email", text)}
                className="rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-3 text-sm text-gray-800"
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          <View className="mb-4">
            <Text className="text-xs text-gray-500 mb-2">Password</Text>
            <View className="rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-3 flex-row items-center">
              <TextInput
                value={form.password}
                onChangeText={(text) => updateField("password", text)}
                className="flex-1 text-sm text-gray-800"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                <Text className="text-xs font-medium text-gray-500">
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
          </View>

          {mode === "signin" && (
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-4 w-4 rounded border border-gray-300 bg-white" />
                <Text className="ml-2 text-xs text-gray-500">Remember me</Text>
              </View>

              <Text className="text-xs font-medium text-[#2563eb]">
                Forgot password?
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="rounded-2xl bg-[#111827] py-4 items-center"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                {mode === "signin" ? "Sign In" : "Create Account"}
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center my-5">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-3 text-xs text-gray-400">or continue with</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 items-center">
              <Text className="font-medium text-gray-700">Google</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 items-center">
              <Text className="font-medium text-gray-700">Apple</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
