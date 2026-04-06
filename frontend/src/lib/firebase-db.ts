import { database } from "./firebase";
import {
  ref,
  push,
  set,
  get,
  remove,
  update,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";

// ---- Types ----

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  imageBase64?: string | null;
  thinking?: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  model: string;
  createdAt: number;
  updatedAt: number;
}

// ---- Chat Operations ----

/**
 * Create a new chat session
 */
export async function createChat(
  title: string = "New Chat",
  model: string = "moxie-deepseek-v3",
  userId: string
): Promise<string> {
  const chatsRef = ref(database, "chats");
  const newChatRef = push(chatsRef);
  const chatId = newChatRef.key!;

  const chatData: Chat = {
    id: chatId,
    userId,
    title,
    model,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await set(newChatRef, chatData);
  return chatId;
}

/**
 * Get all chats for a user, sorted by most recent
 */
export async function getUserChats(userId: string): Promise<Chat[]> {
  const chatsRef = ref(database, "chats");
  // Must use query with equalTo to satisfy Firebase security rules
  const userChatsQuery = query(
    chatsRef,
    orderByChild("userId"),
    equalTo(userId)
  );
  const snapshot = await get(userChatsQuery);

  if (!snapshot.exists()) return [];

  const chats: Chat[] = [];
  snapshot.forEach((child) => {
    chats.push(child.val() as Chat);
  });

  // Sort by updatedAt descending
  return chats.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Add a message to a chat
 */
export async function addMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string,
  model?: string,
  imageBase64?: string | null,
  thinking?: string
): Promise<string> {
  const messagesRef = ref(database, `messages/${chatId}`);
  const newMsgRef = push(messagesRef);
  const msgId = newMsgRef.key!;

  const messageData: ChatMessage = {
    id: msgId,
    role,
    content,
    model: model || undefined,
    imageBase64: imageBase64 || null,
    ...(thinking && { thinking }),
    createdAt: Date.now(),
  };

  await set(newMsgRef, messageData);

  // Update the chat's updatedAt timestamp
  const chatRef = ref(database, `chats/${chatId}`);
  await update(chatRef, { updatedAt: Date.now() });

  return msgId;
}

/**
 * Get all messages for a chat, sorted chronologically
 */
export async function getChatMessages(
  chatId: string
): Promise<ChatMessage[]> {
  const messagesRef = ref(database, `messages/${chatId}`);
  const snapshot = await get(query(messagesRef, orderByChild("createdAt")));

  if (!snapshot.exists()) return [];

  const messages: ChatMessage[] = [];
  snapshot.forEach((child) => {
    messages.push(child.val() as ChatMessage);
  });

  return messages.sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Update chat title
 */
export async function updateChatTitle(
  chatId: string,
  title: string
): Promise<void> {
  const chatRef = ref(database, `chats/${chatId}`);
  await update(chatRef, { title, updatedAt: Date.now() });
}

/**
 * Update chat model
 */
export async function updateChatModel(
  chatId: string,
  model: string
): Promise<void> {
  const chatRef = ref(database, `chats/${chatId}`);
  await update(chatRef, { model, updatedAt: Date.now() });
}

/**
 * Delete a chat and all its messages
 */
export async function deleteChat(chatId: string): Promise<void> {
  await remove(ref(database, `chats/${chatId}`));
  await remove(ref(database, `messages/${chatId}`));
}

/**
 * Validate a hashed API key
 * Returns the userId associated with the key if valid, null otherwise
 */
export async function validateHashedApiKey(
  hashedKey: string
): Promise<{ userId: string } | null> {
  const keyRef = ref(database, `api_keys/${hashedKey}`);
  const snapshot = await get(keyRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.val();
  if (data && data.active !== false) {
    return { userId: data.userId };
  }

  return null;
}

export interface ApiKey {
  id: string;
  userId: string;
  createdAt: number;
  active: boolean;
  lastUsed: number | null;
}

/**
 * Get all API keys for a user
 */
export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  const keysRef = ref(database, "api_keys");
  // Must use query with equalTo to satisfy Firebase security rules
  const userKeysQuery = query(
    keysRef,
    orderByChild("userId"),
    equalTo(userId)
  );
  const snapshot = await get(userKeysQuery);

  if (!snapshot.exists()) return [];

  const keys: ApiKey[] = [];
  snapshot.forEach((child) => {
    keys.push({
      id: child.key!,
      ...child.val(),
    });
  });

  return keys.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Delete an API key
 */
export async function deleteApiKey(hashedKey: string): Promise<void> {
  await remove(ref(database, `api_keys/${hashedKey}`));
}
