export type ConversationType = "direct" | "group";

export interface MediaFile {
  uri: string;
  name: string;
  type: string;
}

export interface Participant {
  _id: string;
  displayName: string;
  profilePicture?: string | null;
  joinedAt: string;
}

export interface SeenUser {
  _id: string;
  displayName?: string;
  profilePicture?: string | null;
}

export interface Group {
  name: string;
  avatarUrl?: string;
  createdBy: string;
}

export interface LastMessage {
  _id: string;
  content: string | null;
  imgUrl?: string | null;
  createdAt: string | null;

  // Backend populate lastMessage.senderId
  senderId: {
    _id: string;
    displayName: string;
    profilePicture?: string | null;
  };
}

export interface Conversation {
  _id: string;
  type: ConversationType;
  group?: Group;
  participants: Participant[];
  lastMessageAt: string;
  seenBy: SeenUser[];
  lastMessage: LastMessage | null;
  unreadCounts: Record<string, number>; // key = userId, value = unread count
  createdAt: string;
  updatedAt: string;
}

export interface ConversationResponse {
  conversations: Conversation[];
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  imgUrl?: string | null;
  audioUrl?: string | null;
  audioDuration?: number | null;
  updatedAt?: string | null;
  createdAt: string;
  isOwn?: boolean;
}

export interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
}

export interface SendDirectMessagePayload {
  recipientId?: string;
  conversationId?: string;
  content?: string;
  image?: MediaFile;
  audio?: MediaFile;
  audioDuration?: number;
}

export interface SendGroupMessagePayload {
  conversationId: string;
  content?: string;
  image?: MediaFile;
  audio?: MediaFile;
  audioDuration?: number;
}

export type CreateDirectConversationPayload = {
  type: "direct";
  memberIds: string[];
};

export type CreateGroupConversationPayload = {
  type: "group";
  name: string;
  memberIds: string[];
  avatar?: {
    uri: string;
    name: string;
    type: string;
  };
};

export type CreateConversationPayload =
  | CreateDirectConversationPayload
  | CreateGroupConversationPayload;
