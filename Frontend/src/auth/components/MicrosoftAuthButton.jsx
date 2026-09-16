import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { PublicClientApplication } from '@azure/msal-browser';
import { env, hasMicrosoftOAuth } from '../../config/env';
import { signInWithOAuthProfile } from '../auth-api';
import { MicrosoftIcon } from './CustomIcons';

const microsoftScopes = ['User.Read'];
let microsoftAuthClient;
let microsoftAuthReady;

function getMicrosoftAuthClient() {
  if (!microsoftAuthClient) {
    microsoftAuthClient = new PublicClientApplication({
      auth: {
        clientId: env.microsoftClientId,
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin,
      },
      cache: {
        cacheLocation: 'sessionStorage',
      },
      system: {
        allowNativeBroker: false,
      },
    });
  }

  if (!microsoftAuthReady) {
    microsoftAuthReady = microsoftAuthClient.initialize();
  }

  return microsoftAuthReady.then(() => microsoftAuthClient);
}

async function fetchMicrosoftProfile(accessToken) {
  const response = await fetch(
    'https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Unable to fetch Outlook profile.');
  }

  return response.json();
}

function EnabledMicrosoftAuthButton({ actionLabel, successLabel, onAuthSuccess }) {
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleMicrosoftAuth = React.useCallback(async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const authClient = await getMicrosoftAuthClient();
      const loginResponse = await authClient.loginPopup({
        scopes: microsoftScopes,
        prompt: 'select_account',
      });
      const profile = await fetchMicrosoftProfile(loginResponse.accessToken);
      const email = profile.mail || profile.userPrincipalName || loginResponse.account?.username;

      if (!email) {
        throw new Error('Microsoft account did not return an email address.');
      }

      console.log(successLabel, {
        credential: loginResponse,
        profile,
      });
      await signInWithOAuthProfile({
        provider: 'microsoft',
        providerId: profile.id || loginResponse.account?.homeAccountId,
        name: profile.displayName || loginResponse.account?.name || email,
        email,
      });
      onAuthSuccess?.();
    } catch (error) {
      console.error(`${successLabel} failed`, error);
      setErrorMessage('Outlook sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [onAuthSuccess, successLabel]);

  return (
    <Stack spacing={1}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      <Button
        fullWidth
        variant="outlined"
        onClick={handleMicrosoftAuth}
        disabled={isSubmitting}
        startIcon={<MicrosoftIcon />}
      >
        {isSubmitting ? 'Connecting to Outlook...' : actionLabel}
      </Button>
    </Stack>
  );
}

export default function MicrosoftAuthButton({ actionLabel, successLabel, onAuthSuccess }) {
  if (!hasMicrosoftOAuth) {
    return (
      <Stack spacing={1}>
        <Button fullWidth variant="outlined" disabled startIcon={<MicrosoftIcon />}>
          {actionLabel}
        </Button>
        <Alert severity="info">Add `VITE_MICROSOFT_CLIENT_ID` to enable Outlook OAuth.</Alert>
      </Stack>
    );
  }

  return (
    <EnabledMicrosoftAuthButton
      actionLabel={actionLabel}
      successLabel={successLabel}
      onAuthSuccess={onAuthSuccess}
    />
  );
}
