import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/theme-context.jsx';
import { env, hasGoogleOAuth } from '../config/env';

export default function AppProviders({ children }) {
  const content = (
    <ThemeProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </ThemeProvider>
  );

  if (!hasGoogleOAuth) {
    return content;
  }

  return <GoogleOAuthProvider clientId={env.googleClientId}>{content}</GoogleOAuthProvider>;
}