// providers/SocketProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";
import { io, Socket } from "socket.io-client";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";

import { SOCKET_BASE_URL, getAuthToken } from "@/utils/api";
import { chatKeys } from "@/hooks/useChat";
import { useMe } from "@/hooks/useMe";
import type { Message, MessagesResponse } from "@/types/chat";

type SocketCtx = { socket: Socket | null; onlineUsers: string[] };

const SocketContext = createContext<SocketCtx>({ socket: null, onlineUsers: [] });
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!me?._id) return;

    const s = io(SOCKET_BASE_URL, {
      transports: ["websocket"], // bỏ polling cho nhẹ và ổn định trên RN
      // token lấy bất đồng bộ từ SecureStore, gọi lại mỗi lần reconnect
      auth: (cb) => {
        getAuthToken().then((token) => cb({ token }));
      },
    });

    const refreshConversations = () =>
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });

    s.on("connect", () => console.log("socket connected", s.id));
    s.on("connect_error", (err) => console.log("socket error:", err.message));

    s.on("online-users", (ids: string[]) => setOnlineUsers(ids));

    // Tin nhắn mới: thêm thẳng vào cache, không cần refetch
    s.on("new-message", ({ message }: { message: Message }) => {
      const convId = String(message.conversationId);

      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        chatKeys.messages(convId),
        (old) => {
          if (!old || !old.pages.length) {
            return old;
          }

          const exists = old.pages.some((p) =>
            p.messages.some((m) => m._id === message._id),
          );
          if (exists) return old; // người gửi cũng nhận lại tin của mình

          const [first, ...rest] = old.pages;

          if (!first) {
            return old;
          }

          return {
            ...old,
            pages: [{ ...first, messages: [...first.messages, message] }, ...rest],
          };
        },
      );

      // lastMessage.senderId trong payload chưa populate nên refetch danh sách
      refreshConversations();
    });

    // Có người đã xem -> cập nhật seenBy / unreadCounts
    s.on("read-message", refreshConversations);

    // Được thêm vào hội thoại mới
    s.on("new-group", refreshConversations);

    setSocket(s);

    // Quay lại app từ background thì kết nối lại và đồng bộ dữ liệu
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        if (!s.connected) s.connect();
        refreshConversations();
        queryClient.invalidateQueries({ queryKey: [...chatKeys.all, "messages"] });
      }
    });

    return () => {
      sub.remove();
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
      setOnlineUsers([]);
    };
  }, [me?._id, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}
