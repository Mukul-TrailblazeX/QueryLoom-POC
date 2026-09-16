import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useGoogleLogin } from '@react-oauth/google';
import { hasGoogleOAuth } from '../../config/env';
import { signInWithOAuthProfile } from '../auth-api';
import { GoogleIcon } from './CustomIcons';

async function fetchGoogleProfile(accessToken) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to fetch Google profile.');
  }

  return response.json();
}

function EnabledGoogleAuthButton({ actionLabel, successLabel, onAuthSuccess }) {
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleGoogleSuccess = React.useCallback(
    async (tokenResponse) => {
      setErrorMessage('');

      try {
        const profile = await fetchGoogleProfile(tokenResponse.access_token);

        console.log(successLabel, {
          credential: tokenResponse,
          profile,
        });
        await signInWithOAuthProfile({
          provider: 'google',
          providerId: profile.sub,
          name: profile.name,
          email: profile.email,
        });
        onAuthSuccess?.();
      } catch (error) {
        console.error(`${successLabel} profile fetch failed`, error);
        setErrorMessage('Google sign-in worked, but we could not load your profile details.');
      }
    },
    [onAuthSuccess, successLabel],
  );

  const handleGoogleError = React.useCallback(
    (errorResponse) => {
      console.error(`${successLabel} failed`, errorResponse);
      setErrorMessage('Google sign-in failed. Please try again.');
    },
    [successLabel],
  );

  const loginWithGoogle = useGoogleLogin({
    scope: 'openid profile email',
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  return (
    <Stack spacing={1}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      <Button
        fullWidth
        variant="outlined"
        onClick={() => loginWithGoogle()}
        startIcon={<GoogleIcon />}
      >
        {actionLabel}
      </Button>
    </Stack>
  );
}

export default function GoogleAuthButton({ actionLabel, successLabel, onAuthSuccess }) {
  if (!hasGoogleOAuth) {
    return (
      <Stack spacing={1}>
        <Button fullWidth variant="outlined" disabled startIcon={<GoogleIcon />}>
          {actionLabel}
        </Button>
        <Alert severity="info">Add `VITE_GOOGLE_CLIENT_ID` to enable Google OAuth.</Alert>
      </Stack>
    );
  }

  return (
    <EnabledGoogleAuthButton
      actionLabel={actionLabel}
      successLabel={successLabel}
      onAuthSuccess={onAuthSuccess}
    />
  );
}
