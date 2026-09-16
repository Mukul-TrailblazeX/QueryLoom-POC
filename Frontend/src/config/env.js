const rawGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const rawMicrosoftClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const env = {
  apiBaseUrl: rawApiBaseUrl?.trim() || '/api/v1',
  googleClientId: rawGoogleClientId?.trim() || '',
  microsoftClientId: rawMicrosoftClientId?.trim() || '',
};

export const hasGoogleOAuth = Boolean(env.googleClientId);
export const hasMicrosoftOAuth = Boolean(env.microsoftClientId);
