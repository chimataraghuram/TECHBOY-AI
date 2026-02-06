import { ChatSession, Message, Role } from '../types';
import { INITIAL_GREETING } from '../constants';

const STORAGE_KEY = 'techboy_ai_sessions';
const ACTIVE_SESSION_KEY = 'techboy_ai_active_session_id';

export const getSessions = (): ChatSession[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const sessions: ChatSession[] = JSON.parse(stored);
        
        // Convert string timestamps back to Date objects and sort by recent
        return sessions
            .map(session => ({
                ...session,
                messages: session.messages.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }))
            }))
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
        console.error("Failed to load sessions", error);
        return [];
    }
};

export const getSession = (id: string): ChatSession | undefined => {
    const sessions = getSessions();
    return sessions.find(s => s.id === id);
};

export const saveSession = (session: ChatSession) => {
    const sessions = getSessions();
    const index = sessions.findIndex(s => s.id === session.id);

    if (index >= 0) {
        sessions[index] = session;
    } else {
        sessions.unshift(session); // Add new sessions to the top
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const createNewSession = (): ChatSession => {
    const newSession: ChatSession = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [{
            id: 'init-' + Date.now(),
            role: Role.MODEL,
            text: INITIAL_GREETING,
            timestamp: new Date(),
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    saveSession(newSession);
    return newSession;
};

export const getActiveSessionId = (): string | null => {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
};

export const setActiveSessionId = (id: string) => {
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
};

export const updateSessionTitle = (sessionId: string, firstMessage: string) => {
    const sessions = getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index >= 0) {
        // Simple truncation for title
        let title = firstMessage.substring(0, 30);
        if (firstMessage.length > 30) title += "...";

        sessions[index].title = title;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
}
