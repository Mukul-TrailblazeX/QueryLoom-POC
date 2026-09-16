import { env } from '../config/env';
import { getAuthSession, updateAuthTokens } from '../auth/session';

function buildUrl(path) {
  return `${env.apiBaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(payload, fallback) {
  if (typeof payload?.detail === 'string') {
    return payload.detail;
  }

  if (Array.isArray(payload?.detail)) {
    return payload.detail.map((item) => item.msg).filter(Boolean).join(' ');
  }

  return fallback;
}

export async function apiRequest(path, options = {}) {
  const {
    auth = true,
    retryOnUnauthorized = true,
    headers,
    body,
    ...fetchOptions
  } = options;
  const session = getAuthSession();
  const requestHeaders = new Headers(headers);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (body !== undefined && !isFormData && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (auth && session?.accessToken) {
    requestHeaders.set('Authorization', `Bearer ${session.accessToken}`);
  }

  const response = await fetch(buildUrl(path), {
    ...fetchOptions,
    headers: requestHeaders,
    body: body === undefined || isFormData ? body : JSON.stringify(body),
  });
  const payload = await parseResponse(response);

  if (response.status === 401 && auth && retryOnUnauthorized && session?.refreshToken) {
    const refreshed = await apiRequest('/auth/refresh', {
      auth: false,
      retryOnUnauthorized: false,
      method: 'POST',
      body: { refresh_token: session.refreshToken },
    });

    updateAuthTokens(refreshed);
    return apiRequest(path, { ...options, retryOnUnauthorized: false });
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Request failed. Please try again.'));
  }

  return payload;
}
