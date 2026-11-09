// hooks/useMe.ts
import { useQuery } from "@tanstack/react-query";
import { userApi, useApiClient } from "@/utils/api";

export const useMe = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: ["me"],
    queryFn: () => userApi.getCurrentUser(api),
    select: (res) => (res.data.user ?? res.data) as { _id: string },
    staleTime: 5 * 60 * 1000,
  });
};
