import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userApi, useApiClient } from "@/utils/api";

export type FriendshipStatus =
  | "not_friends"
  | "request_sent"
  | "request_received"
  | "friends";

export interface SearchUser {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  friendshipStatus: FriendshipStatus;
  requestId: string | null;
  // Tuỳ chọn: BE chưa trả, có thì UI tự hiện
  title?: string; // badge "UI/UX"
  isOnline?: boolean;
  lastActiveText?: string; // "Hoạt động 2 giờ trước"
}

function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export const useSearchUsers = (rawInput: string) => {
  const api = useApiClient();
  const cleaned = rawInput.trim().replace(/^@/, "");
  const debounced = useDebounce(cleaned, 400);

  const query = useQuery({
    queryKey: ["users", "search", debounced],
    queryFn: async () => {
      const res = await userApi.searchUsers(api, debounced);
      return res.data as { success: boolean; data: SearchUser[]; total: number };
    },
    enabled: debounced.length > 0,
  });

  return {
    users: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    isSearching: query.isFetching || cleaned !== debounced,
    hasQuery: cleaned.length > 0,
    isError: query.isError,
  };
};
