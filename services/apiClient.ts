// ============================================================================
// 🔗 API CLIENT - Centralized Backend Communication Layer
// All API calls go through this client for consistent auth & error handling.
// ============================================================================

export const API_URL: string =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

const TOKEN_KEY = 'techboy_token';

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// ---------------------------------------------------------------------------
// Generic fetch wrapper
// ---------------------------------------------------------------------------

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | string | FormData;
  /** If true the raw Response object is returned instead of parsed JSON */
  raw?: boolean;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, raw, headers: extraHeaders, ...rest } = options;

  const token = getToken();

  const headers: Record<string, string> = {
    ...(extraHeaders as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type for JSON bodies (not FormData)
  if (body && !(body instanceof FormData) && typeof body !== 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...rest,
    headers,
    body:
      body instanceof FormData || typeof body === 'string'
        ? (body as BodyInit)
        : body
          ? JSON.stringify(body)
          : undefined,
  });

  // Handle 401 – force re-auth
  if (response.status === 401) {
    removeToken();
    throw new Error('Session expired. Please log in again.');
  }

  if (raw) {
    return response as unknown as T;
  }

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.detail || errorBody.message || errorMessage;
    } catch {
      // body wasn't JSON – use status text
    }
    throw new Error(errorMessage);
  }

  // Some endpoints may return 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}
