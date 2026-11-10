import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { friendApi, useApiClient } from "@/utils/api";

// Query keys: quản lý cache tập trung
export const friendKeys = {
  all: ["friends"] as const,
  list: () => [...friendKeys.all, "list"] as const,
  requests: () => [...friendKeys.all, "requests"] as const,
};
const SEARCH_KEY = ["users", "search"] as const;

// 1. Lấy danh sách bạn bè
export const useFriends = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: friendKeys.list(),
    queryFn: async () => {
      const response = await friendApi.getFriendsList(api);
      return response.data.friends;
    },
  });
};

// 2. Lấy danh sách lời mời kết bạn (đã gửi + đã nhận)
export const useFriendRequests = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: friendKeys.requests(),
    queryFn: async () => {
      const response = await friendApi.getRequestedFriends(api);
      return response.data;
    },
  });
};

const useRefreshAfterChange = () => {
  const qc = useQueryClient();
  return (keys: readonly (readonly string[])[]) =>
    keys.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
};

// 3. Gửi lời mời kết bạn
export const useSendFriendRequest = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const refresh = useRefreshAfterChange();
  return useMutation({
    mutationFn: async (data: { to: string; message?: string }) => {
      const response = await friendApi.sendFriendRequest(api, data);
      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.requests() });
      queryClient.invalidateQueries({ queryKey: ["users", "search"] });
    },
  });
};

// 4. Chấp nhận lời mời kết bạn
export const useAcceptFriendRequest = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const refresh = useRefreshAfterChange();
  return useMutation({
    mutationFn: async (requestId: string) =>
      (await friendApi.acceptFriendRequest(api, requestId)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
      queryClient.invalidateQueries({ queryKey: ["users", "search"] });
    },
  });
};

// 5. Từ chối lời mời (người nhận) hoặc huỷ lời mời (người gửi)
export const useDeclineFriendRequest = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await friendApi.declineFriendRequest(api, requestId);
      return response.status;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.requests() });
      queryClient.invalidateQueries({ queryKey: ["users", "search"] });
    },
  });
};
