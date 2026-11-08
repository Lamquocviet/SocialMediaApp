import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { chatService, useApiClient } from "@/utils/api";

import type {
  CreateConversationPayload,
  SendDirectMessagePayload,
  SendGroupMessagePayload,
  Message,
} from "@/types/chat";

// ========================================
// QUERY KEYS
// ========================================

export const chatKeys = {
  all: ["chat"] as const,

  conversations: () => [...chatKeys.all, "conversations"] as const,

  messages: (conversationId: string) =>
    [...chatKeys.all, "messages", conversationId] as const,
};

// ========================================
// GET CONVERSATIONS
// ========================================

export const useConversations = () => {
  const api = useApiClient();

  return useQuery({
    queryKey: chatKeys.conversations(),

    queryFn: () => chatService.fetchConversations(api),

    staleTime: 30 * 1000,
  });
};

// ========================================
// GET MESSAGES
// ========================================

export const useMessages = (conversationId: string) => {
  const api = useApiClient();

  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),

    queryFn: ({ pageParam }) =>
      chatService.fetchMessages(api, conversationId, pageParam),

    initialPageParam: null as string | null,

    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,

    enabled: !!conversationId,

    staleTime: 30 * 1000,
  });
};

// ========================================
// SEND DIRECT MESSAGE
// ========================================

export const useSendDirectMessage = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendDirectMessagePayload) =>
      chatService.sendDirectMessage(api, payload),

    onSuccess: async (message: Message) => {
      const conversationId = message.conversationId?.toString();

      const tasks = [
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversations(),
        }),
      ];

      if (conversationId) {
        tasks.push(
          queryClient.invalidateQueries({
            queryKey: chatKeys.messages(conversationId),
          }),
        );
      }

      await Promise.all(tasks);
    },
  });
};

// ========================================
// SEND GROUP MESSAGE
// ========================================

export const useSendGroupMessage = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendGroupMessagePayload) =>
      chatService.sendGroupMessage(api, payload),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversations(),
        }),

        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(variables.conversationId),
        }),
      ]);
    },
  });
};

// ========================================
// CREATE CONVERSATION
// ========================================

export const useCreateConversation = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateConversationPayload) =>
      chatService.createConversation(api, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
    },
  });
};

// ========================================
// MARK AS SEEN
// ========================================

export const useMarkAsSeen = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      chatService.markAsSeen(api, conversationId),

    onSuccess: async (_, conversationId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversations(),
        }),

        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(conversationId),
        }),
      ]);
    },
  });
};
