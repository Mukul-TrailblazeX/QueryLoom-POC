import { apiRequest } from '../api/client';
import { getAuthSession } from '../auth/session';

const CHAT_HISTORY_PREFIX = 'kriyanto.chat.history.';

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getStorageKey(userId) {
  return `${CHAT_HISTORY_PREFIX}${userId}`;
}

export function createEmptyChat() {
  const now = new Date().toISOString();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    title: 'New Chat',
    messages: [],
    documents: [],
    createdAt: now,
    updatedAt: now,
    isStarred: false,
    share: {
      chatId: id,
      isShared: false,
      shareId: null,
      shareUrl: null,
      sharedAt: null,
    },
  };
}

function hasBackendSession() {
  return Boolean(getAuthSession()?.accessToken);
}

function mapSession(session, messages = []) {
  const extraData = session.extra_data || {};

  return {
    id: session.id,
    title: session.title,
    messages: messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
    })),
    documents: extraData.documents || [],
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    isStarred: Boolean(extraData.isStarred),
    share: extraData.share || {
      chatId: session.id,
      isShared: false,
      shareId: null,
      shareUrl: null,
      sharedAt: null,
    },
  };
}

function buildSessionExtraData(chat) {
  return {
    documents: chat.documents || [],
    isStarred: Boolean(chat.isStarred),
    share: chat.share || {
      chatId: chat.id,
      isShared: false,
      shareId: null,
      shareUrl: null,
      sharedAt: null,
    },
  };
}

export async function loadChatHistory(userId) {
  if (hasBackendSession()) {
    const sessions = await apiRequest('/chats/sessions');
    const chats = await Promise.all(
      sessions.map(async (session) => {
        const sessionWithMessages = await apiRequest(`/chats/sessions/${session.id}`);
        return mapSession(sessionWithMessages, sessionWithMessages.messages || []);
      }),
    );

    return chats;
  }

  if (typeof window === 'undefined') {
    return [];
  }

  const rawHistory = window.localStorage.getItem(getStorageKey(userId));
  const parsedHistory = safeParse(rawHistory);

  if (!Array.isArray(parsedHistory)) {
    return [];
  }

  return parsedHistory;
}

export async function saveChatHistory(userId, chats) {
  if (hasBackendSession()) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(chats));
}

export async function createBackendChat(chat) {
  if (!hasBackendSession()) {
    return chat;
  }

  const session = await apiRequest('/chats/sessions', {
    method: 'POST',
    body: {
      title: chat.title,
      extra_data: buildSessionExtraData(chat),
    },
  });

  return mapSession(session);
}

export async function updateBackendChat(chat) {
  if (!hasBackendSession()) {
    return chat;
  }

  const session = await apiRequest(`/chats/sessions/${chat.id}`, {
    method: 'PATCH',
    body: {
      title: chat.title,
      extra_data: buildSessionExtraData(chat),
    },
  });

  return mapSession(session, chat.messages || []);
}

export async function deleteBackendChat(chatId) {
  if (!hasBackendSession()) {
    return;
  }

  await apiRequest(`/chats/sessions/${chatId}`, {
    method: 'DELETE',
  });
}

export async function createBackendMessage(chatId, message) {
  if (!hasBackendSession()) {
    return message;
  }

  const savedMessage = await apiRequest(`/chats/sessions/${chatId}/messages`, {
    method: 'POST',
    body: {
      role: message.role,
      content: message.content,
    },
  });

  return {
    id: savedMessage.id,
    role: savedMessage.role,
    content: savedMessage.content,
  };
}

export async function uploadRagDocuments(type, files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return apiRequest(`/rag/documents/${type}`, {
    method: 'POST',
    body: formData,
  });
}

export async function queryRag(query, documentIds = []) {
  return apiRequest('/rag/query', {
    method: 'POST',
    body: {
      query,
      document_ids: documentIds,
      filters: { document_ids: documentIds },
    },
  });
}
