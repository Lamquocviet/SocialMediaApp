import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ChatRoom, { ChatType } from "@/components/chatComponent/ChatRoom";

export default function ChatDetailScreen() {
  const router = useRouter();
  const { type, name, avatar, memberCount } = useLocalSearchParams<{
    id: string;
    type?: ChatType;
    name?: string;
    avatar?: string;
    memberCount?: string;
  }>();

  return (
    <ChatRoom
      type={type === "group" ? "group" : "direct"}
      name={name ?? "Người dùng"}
      avatar={avatar}
      memberCount={Number(memberCount ?? 0)}
      onBack={() => router.back()}
    />
  );
}
