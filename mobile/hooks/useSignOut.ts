import { Alert } from "react-native";
import { router } from "expo-router";
import { clearAuthToken } from "../utils/api";

export const useSignOut = () => {
  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await clearAuthToken();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return { handleSignOut };
};
