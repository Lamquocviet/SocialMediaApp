import { Alert } from "react-native";
import { router } from "expo-router";
import { clearAuthToken } from "../utils/api";
import { useQueryClient } from "@tanstack/react-query";

export const useSignOut = () => {
  const queryClient = useQueryClient();
  const handleSignOut = () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            //Huỷ các request đang chạy, tránh nó ghi data cũ vào cache sau khi clear
            await queryClient.cancelQueries();

            await clearAuthToken();
            router.replace("/(auth)/login");
            //Xoá toàn bộ cache (conversations, messages, posts, ...)
            queryClient.clear();
          },
        },
      ],
    );
  };

  return { handleSignOut };
};
