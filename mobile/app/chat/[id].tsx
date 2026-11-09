import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ChatRoom, { ChatType } from "@/components/chatComponent/ChatRoom";

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id, type, name, avatar, recipientId } = useLocalSearchParams<{
    id: string;
    type?: ChatType;
    name?: string;
    avatar?: string;
    recipientId?: string;
  }>();

  return (
    <ChatRoom
      conversationId={id === "new" ? undefined : id}
      recipientId={recipientId}
      fallbackType={type === "group" ? "group" : "direct"}
      fallbackName={name}
      fallbackAvatar={avatar}
      onBack={() => router.back()}
      onConversationCreated={(newId) => router.setParams({ id: newId })}
    />
  );
}
