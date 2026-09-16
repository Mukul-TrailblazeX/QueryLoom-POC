const AUTH_SESSION_KEY = 'kriyanto.auth.session';

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function buildInitials(name = '', email = '') {
  const trimmedName = name.trim();
  if (trimmedName) {
    const parts = trimmedName.split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'U';
  }

  return email.slice(0, 2).toUpperCase() || 'U';
}

export function getAuthSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_SESSION_KEY);
  const session = safeParse(rawSession);

  if (!session?.id || !session?.email) {
    return null;
  }

  return {
    ...session,
    initials: session.initials || buildInitials(session.name, session.email),
  };
}

export function saveAuthSession({ id, name, email, tokens }) {
  if (typeof window === 'undefined') {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim() || normalizedEmail.split('@')[0];
  const session = {
    id: id || `user-${normalizedEmail}`,
    name: normalizedName,
    email: normalizedEmail,
    initials: buildInitials(normalizedName, normalizedEmail),
    accessToken: tokens?.access_token || tokens?.accessToken || null,
    refreshToken: tokens?.refresh_token || tokens?.refreshToken || null,
    tokenType: tokens?.token_type || tokens?.tokenType || 'bearer',
  };

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function updateAuthTokens(tokens) {
  const currentSession = getAuthSession();

  if (!currentSession) {
    return null;
  }

  return saveAuthSession({
    ...currentSession,
    tokens,
  });
}

export function clearAuthSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_KEY);
}

export function isAuthenticated() {
  return Boolean(getAuthSession());
}
