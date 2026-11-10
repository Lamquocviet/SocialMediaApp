import { Alert } from "react-native";
import { router } from "expo-router";
import { clearAuthToken } from "../utils/api";
import { useQueryClient } from "@tanstack/react-query";

export const useSignOut = () => {
  const queryClient = useQueryClient();
  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          //Huỷ các request đang chạy, tránh nó ghi data cũ vào cache sau khi clear
          await queryClient.cancelQueries();
          // await queryClient.cancelQueries([
          //   "authUser",
          //   "me",
          //   "conversations",
          //   "messages",
          //   "posts",
          // ]);
          await clearAuthToken();
          router.replace("/(auth)/login");
          //Xoá toàn bộ cache (conversations, messages, posts, ...)
          queryClient.clear();
        },
      },
    ]);
  };

  return { handleSignOut };
};
