import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getAuthToken, useApiClient, userApi } from "../utils/api";

export const useUserSync = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const api = useApiClient();

  const syncUserMutation = useMutation({
    mutationFn: () => userApi.syncUser(api),
    onSuccess: (response: any) =>
      console.log("User synced successfully:", response.data.user),
    onError: (error: any) => {
      console.log("code:", error.code);
      console.log("baseURL:", error.config?.baseURL);
      console.log("url:", error.config?.url);
      console.log("status:", error.response?.status);
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken();
      setIsAuthenticated(Boolean(token));
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !syncUserMutation.data) {
      syncUserMutation.mutate();
    }
  }, [isAuthenticated, syncUserMutation.data]);

  return null;
};
