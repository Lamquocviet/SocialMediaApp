import axios, { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://x-clone-rn.vercel.app/api";
const AUTH_TOKEN_KEY = "authToken";
// ! 🔥 localhost api would not work on your actual physical device
// const API_BASE_URL = "http://localhost:5001/api";

export const getAuthToken = (): Promise<string | null> =>
  SecureStore.getItemAsync(AUTH_TOKEN_KEY);

export const saveAuthToken = (token: string): Promise<void> =>
  SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);

export const clearAuthToken = (): Promise<void> =>
  SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);

// this will basically create an authenticated api, pass the token into our headers
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

export const useApiClient = (): AxiosInstance => {
  return createApiClient(getAuthToken);
};

export const authApi = {
  signUp: (payload: {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
  }) => axios.post(`${API_BASE_URL}/auth/signup`, payload),
  signIn: (payload: { username: string; password: string }) =>
    axios.post(`${API_BASE_URL}/auth/signin`, payload),
};

export const userApi = {
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
