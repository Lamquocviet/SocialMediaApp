import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ChatRoom from "@/components/chatComponent/ChatRoom";
import type { ConversationType } from "@/types/chat";
export default function ChatDetailScreen() {
  const router = useRouter();
  const { id, type, name, avatar, recipientId } = useLocalSearchParams<{
    id: string;
    type?: ConversationType;
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
