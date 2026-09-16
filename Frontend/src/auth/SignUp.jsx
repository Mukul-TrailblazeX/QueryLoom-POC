import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Link from '@mui/material/Link';
import MuiCard from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import GoogleAuthButton from './components/GoogleAuthButton';
import MicrosoftAuthButton from './components/MicrosoftAuthButton';
import { SitemarkIcon } from './components/CustomIcons';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { signUpWithEmail } from './auth-api';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  position: 'relative',
  minHeight: '100dvh',
  padding: theme.spacing(2),
  overflowY: 'auto',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignUp(props) {
  const navigate = useNavigate();
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState('');
  const [submitErrorMessage, setSubmitErrorMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateInputs = () => {
    const fullName = document.getElementById('name');
    const email = document.getElementById('signup-email');
    const password = document.getElementById('signup-password');
    const confirmPassword = document.getElementById('confirm-password');

    let isValid = true;

    if (!fullName.value.trim()) {
      setNameError(true);
      setNameErrorMessage('Please enter your full name.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 8) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 8 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!confirmPassword.value || confirmPassword.value !== password.value) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage('Passwords do not match.');
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitErrorMessage('');

    if (!validateInputs()) {
      return;
    }

    const data = new FormData(event.currentTarget);

    try {
      setIsSubmitting(true);
      await signUpWithEmail({
        name: String(data.get('name') || ''),
        email: String(data.get('email') || ''),
        password: String(data.get('password') || ''),
      });
      navigate('/app', { replace: true });
    } catch (error) {
      setSubmitErrorMessage(error.message || 'Unable to create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" sx={{ justifyContent: 'center', py: { xs: 10, sm: 6 } }}>
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign up
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            {submitErrorMessage ? <Alert severity="error">{submitErrorMessage}</Alert> : null}
            <FormControl>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <TextField
                error={nameError}
                helperText={nameErrorMessage}
                id="name"
                type="text"
                name="name"
                placeholder="Your full name"
                autoComplete="name"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={nameError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="signup-email">Email</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="signup-email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                required
                fullWidth
                variant="outlined"
                color={emailError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="signup-password">Password</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="Create a password"
                type="password"
                id="signup-password"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="confirm-password">Confirm password</FormLabel>
              <TextField
                error={confirmPasswordError}
                helperText={confirmPasswordErrorMessage}
                name="confirmPassword"
                placeholder="Confirm your password"
                type="password"
                id="confirm-password"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                color={confirmPasswordError ? 'error' : 'primary'}
              />
            </FormControl>
            <Button type="submit" fullWidth variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </Box>
          <Divider>or</Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <GoogleAuthButton
              actionLabel="Sign up with Google"
              successLabel="Google sign-up success"
              onAuthSuccess={() => navigate('/app', { replace: true })}
            />
            <MicrosoftAuthButton
              actionLabel="Sign up with Outlook"
              successLabel="Outlook sign-up success"
              onAuthSuccess={() => navigate('/app', { replace: true })}
            />
            <Typography sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/auth?mode=signin')}
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
