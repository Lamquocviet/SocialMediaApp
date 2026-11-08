import axios, { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";
import { useMemo } from "react";
import type {
  ConversationResponse,
  MessagesResponse,
  CreateConversationPayload,
  SendDirectMessagePayload,
  SendGroupMessagePayload,
} from "@/types/chat";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.5:5001";
const AUTH_TOKEN_KEY = "authToken";
// ! 🔥 localhost api would not work on your actual physical device

export const getAuthToken = (): Promise<string | null> =>
  SecureStore.getItemAsync(AUTH_TOKEN_KEY);

export const saveAuthToken = (token: string): Promise<void> =>
  SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);

export const clearAuthToken = (): Promise<void> =>
  SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);

// this will basically create an authenticated api, pass the token into our headers
// CREATE API CLIENT
export const createApiClient = (
  getToken: () => Promise<string | null>,
): AxiosInstance => {
  const api = axios.create({ baseURL: API_BASE_URL });

  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};
// API CLIENT HOOK
export const useApiClient = (): AxiosInstance => {
  return useMemo(() => createApiClient(getAuthToken), []);
};

// export const useApiClient = (): AxiosInstance => {
//   return createApiClient(getAuthToken);
// };

export const authApi = {
  signUp: (payload: {
    username: string;
    password: string;
    email: string;
    displayName: string;
  }) => axios.post(`${API_BASE_URL}/auth/signup`, payload),
  signIn: (payload: { username: string; password: string }) =>
    axios.post(`${API_BASE_URL}/auth/signin`, payload),
};

const pageLimit = 50;

export const chatService = {
  // 1. Lấy danh sách hội thoại
  fetchConversations: async (api: AxiosInstance): Promise<ConversationResponse> => {
    const response = await api.get("/conversations");

    return response.data;
  },

  // 2. Lấy tin nhắn theo hội thoại (phân trang bằng cursor)
  // GET /conversations/:id/messages
  fetchMessages: async (
    api: AxiosInstance,
    conversationId: string,
    cursor?: string | null,
  ): Promise<MessagesResponse> => {
    const response = await api.get(`/conversations/${conversationId}/messages`, {
      params: {
        limit: 50,
        ...(cursor ? { cursor } : {}),
      },
    });

    return response.data;
  },

  // 3. Gửi tin nhắn trực tiếp (Dùng JSON thay vì FormData vì truyền imgUrl dạng chuỗi)
  sendDirectMessage: async (
    api: AxiosInstance,
    payload: SendDirectMessagePayload,
  ) => {
    const response = await api.post("/messages/direct", payload);

    return response.data.message;
  },

  // 4. Gửi tin nhắn nhóm
  sendGroupMessage: async (api: AxiosInstance, payload: SendGroupMessagePayload) => {
    const response = await api.post("/messages/group", payload);

    return response.data.message;
  },

  // 5. Đánh dấu đã xem
  markAsSeen: async (api: AxiosInstance, conversationId: string) => {
    const res = await api.patch(`/conversations/${conversationId}/seen`);
    return res.data;
  },

  // 6. Tạo cuộc hội thoại mới
  // POST /conversations
  createConversation: async (
    api: AxiosInstance,
    payload: CreateConversationPayload,
  ) => {
    const response = await api.post("/conversations", payload);

    return response.data.conversation;
  },
};
export const userApi = {
  searchUsers: (api: AxiosInstance, query: string) =>
    api.get(`/users/search?query=${query}`),
  syncUser: (api: AxiosInstance) => api.post("/users/sync"),
  getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
  updateProfile: (api: AxiosInstance, data: any) => api.put("/users/profile", data),
};

export const postApi = {
  createPost: (api: AxiosInstance, data: { content: string; image?: string }) =>
    api.post("/posts", data),
  getPosts: (api: AxiosInstance) => api.get("/posts"),
  getUserPosts: (api: AxiosInstance, username: string) =>
    api.get(`/posts/user/${username}`),
  likePost: (api: AxiosInstance, postId: string) =>
    api.post(`/posts/${postId}/like`),
  deletePost: (api: AxiosInstance, postId: string) => api.delete(`/posts/${postId}`),
};

export const commentApi = {
  createComment: (api: AxiosInstance, postId: string, content: string) =>
    api.post(`/comments/post/${postId}`, { content }),
};
