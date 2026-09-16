import { apiRequest } from '../api/client';
import { saveAuthSession } from './session';

function saveBackendSession(authResponse) {
  return saveAuthSession({
    id: authResponse.user.id,
    name: authResponse.user.full_name,
    email: authResponse.user.email,
    tokens: authResponse.tokens,
  });
}

export async function signInWithEmail({ email, password }) {
  const authResponse = await apiRequest('/auth/login', {
    auth: false,
    method: 'POST',
    body: { email, password },
  });

  return saveBackendSession(authResponse);
}

export async function signUpWithEmail({ name, email, password }) {
  const authResponse = await apiRequest('/auth/register', {
    auth: false,
    method: 'POST',
    body: {
      full_name: name,
      email,
      password,
    },
  });

  return saveBackendSession(authResponse);
}

function buildOAuthPassword(provider, providerId) {
  return `KriyantoOAuth-${provider}-${providerId}`.slice(0, 112) + '!A1';
}

export async function signInWithOAuthProfile({ provider, providerId, name, email }) {
  const password = buildOAuthPassword(provider, providerId || email);
  const payload = {
    full_name: name || email.split('@')[0],
    email,
    password,
  };

  try {
    const authResponse = await apiRequest('/auth/register', {
      auth: false,
      method: 'POST',
      body: payload,
    });

    return saveBackendSession(authResponse);
  } catch (error) {
    if (!error.message.toLowerCase().includes('email already in use')) {
      throw error;
    }
  }

  const authResponse = await apiRequest('/auth/login', {
    auth: false,
    method: 'POST',
    body: {
      email,
      password,
    },
  });

  return saveBackendSession(authResponse);
}
