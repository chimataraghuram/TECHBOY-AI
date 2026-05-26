// ============================================================================
// 💬 CHAT SERVICE - Backend-Powered Session Management
// All persistence is now handled by the FastAPI backend + MongoDB.
// ============================================================================

import { ChatSession, Message, Role } from '../types';
import { INITIAL_GREETING } from '../constants';
import { apiRequest } from './apiClient';

// We still keep the active session id in localStorage for quick client-side access
const ACTIVE_SESSION_KEY = 'techboy_ai_active_session_id';

// ---------------------------------------------------------------------------
// Helpers to map backend response shapes → frontend ChatSession type
// ---------------------------------------------------------------------------

function mapBackendSession(raw: any): ChatSession {
  return {
    id: raw.session_id || raw.id || raw._id || '',
    title: raw.title || 'New Chat',
    messages: Array.isArray(raw.messages)
      ? raw.messages.map((m: any) => ({
          id: m.id || m._id || String(Date.now() + Math.random()),
          role: m.role === 'user' ? Role.USER : Role.MODEL,
          text: m.text || m.content || '',
          timestamp: new Date(m.timestamp || m.created_at || Date.now()),
          isError: m.isError || false,
        }))
      : [],
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch all chat sessions from the backend.
 */
export const getSessions = async (): Promise<ChatSession[]> => {
  try {
    const data = await apiRequest<{ sessions: any[] }>('/history');
    const sessions = (data.sessions || []).map(mapBackendSession);
    // Sort most-recent first
    sessions.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    return sessions;
  } catch (error) {
    console.error('Failed to load sessions from backend', error);
    return [];
  }
};

/**
 * Fetch a single session by ID.
 */
export const getSession = async (
  sessionId: string,
): Promise<ChatSession | undefined> => {
  try {
    const raw = await apiRequest(`/history/${sessionId}`);
    return mapBackendSession(raw);
  } catch {
    return undefined;
  }
};

/**
 * Create a new empty session (client-side only until the first message is sent
 * to /chat, which auto-creates a backend session).
 */
export const createNewSession = (): ChatSession => {
  const newSession: ChatSession = {
    id: Date.now().toString(),
    title: 'New Chat',
    messages: [
      {
        id: 'init-' + Date.now(),
        role: Role.MODEL,
        text: INITIAL_GREETING,
        timestamp: new Date(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return newSession;
};

/**
 * Persist the session — currently a no-op on the frontend because the backend
 * auto-saves sessions as messages are sent via /chat. We keep the signature
 * so existing App.tsx callers don't break.
 */
export const saveSession = (_session: ChatSession): void => {
  // Backend handles persistence automatically via /chat endpoint
};

/**
 * Store the active session ID in localStorage for quick hydration.
 */
export const setActiveSessionId = (id: string): void => {
  localStorage.setItem(ACTIVE_SESSION_KEY, id);
};

/**
 * Read the active session ID from localStorage.
 */
export const getActiveSessionId = (): string | null => {
  return localStorage.getItem(ACTIVE_SESSION_KEY);
};

/**
 * Rename a session via the backend.
 */
export const renameSession = async (
  sessionId: string,
  newTitle: string,
): Promise<void> => {
  try {
    await apiRequest(`/history/${sessionId}`, {
      method: 'PUT',
      body: { title: newTitle },
    });
  } catch (error) {
    console.error('Failed to rename session', error);
  }
};

/**
 * Alias kept for backward compatibility with App.tsx.
 */
export const updateSessionTitle = renameSession;

/**
 * Delete a session via the backend.
 */
export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    await apiRequest(`/history/${sessionId}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Failed to delete session', error);
  }
};
