// ============================================================================
// 🤖 AI SERVICE - Backend-Powered Streaming Chat
// All AI inference is now handled by the FastAPI backend.
// This service streams responses via SSE / ReadableStream.
// ============================================================================

import { API_URL, getToken } from './apiClient';

/**
 * Send a chat message to the backend and yield text chunks as they stream in.
 *
 * @param message  The user's message text
 * @param sessionId  Optional session ID for conversation continuity
 */
export async function* sendMessageStream(
  message: string,
  sessionId: string | null = null,
): AsyncGenerator<string> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const body: Record<string, unknown> = { message };
  if (sessionId) {
    body.session_id = sessionId;
  }

  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    let detail = `Chat request failed (${response.status})`;
    try {
      const err = await response.json();
      detail = err.detail || err.message || detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  // Determine if the response is streaming (SSE) or plain JSON
  const contentType = response.headers.get('content-type') || '';

  if (
    contentType.includes('text/event-stream') ||
    contentType.includes('text/plain') ||
    contentType.includes('application/octet-stream')
  ) {
    // ---------- Streaming path ----------
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines in the buffer
      const lines = buffer.split('\n');
      // Keep the last (potentially incomplete) line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // SSE format: "data: ..."
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);
          if (data === '[DONE]') return;

          // Try to parse as JSON (some backends send {text: "..."})
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              yield parsed.text;
            } else if (parsed.content) {
              yield parsed.content;
            } else if (typeof parsed === 'string') {
              yield parsed;
            } else {
              yield data;
            }
          } catch {
            // Plain text chunk
            yield data;
          }
        } else {
          // Non-SSE streaming – yield line as-is
          yield trimmed;
        }
      }
    }

    // Flush any remaining buffer content
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6);
        if (data !== '[DONE]') yield data;
      } else {
        yield trimmed;
      }
    }
  } else {
    // ---------- JSON fallback ----------
    const json = await response.json();
    const text =
      json.response || json.text || json.content || json.message || '';
    if (text) {
      yield text;
    }
  }
}
