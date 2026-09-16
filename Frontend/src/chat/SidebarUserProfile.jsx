import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Grow from '@mui/material/Grow';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  Check,
  ChevronRight,
  CircleHelp,
  LogOut,
  Plus,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';

function MenuItem({ icon, label, endIcon, onClick, onMouseEnter, onMouseLeave }) {
  return (
    <Stack
      component="button"
      type="button"
      direction="row"
      alignItems="center"
      spacing={1.25}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{
        width: '100%',
        border: 0,
        backgroundColor: 'transparent',
        color: 'text.primary',
        cursor: 'pointer',
        px: '14px',
        py: '10px',
        borderRadius: 1.5,
        font: 'inherit',
        textAlign: 'left',
        transition: 'background-color 150ms ease',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <Box sx={{ color: 'text.secondary', display: 'grid', placeItems: 'center', width: 18, flexShrink: 0 }}>
        {icon}
      </Box>
      <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0, fontWeight: 500 }}>
        {label}
      </Typography>
      {endIcon ? (
        <Box sx={{ color: 'text.secondary', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          {endIcon}
        </Box>
      ) : null}
    </Stack>
  );
}

function AccountRow({ user, onMouseEnter, onMouseLeave }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.25}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{
        px: '14px',
        py: '10px',
        borderRadius: 1.5,
        cursor: 'default',
        transition: 'background-color 150ms ease',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <Avatar
        sx={{
          width: 30,
          height: 30,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {user.initials}
      </Avatar>
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {user.email}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', lineHeight: 1.35 }}>
          {user.name}
        </Typography>
      </Box>
      <Check size={16} />
    </Stack>
  );
}

export default function SidebarUserProfile({
  user,
  planLabel = 'Free',
  collapsed = false,
  onLogout,
  onAddAccount,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = React.useState(null);
  const menuRef = React.useRef(null);
  const flyoutRef = React.useRef(null);
  const closeFlyoutTimerRef = React.useRef(null);
  const open = Boolean(anchorEl);
  const accountFlyoutOpen = open && Boolean(accountAnchorEl);

  const clearFlyoutCloseTimer = React.useCallback(() => {
    if (closeFlyoutTimerRef.current) {
      window.clearTimeout(closeFlyoutTimerRef.current);
      closeFlyoutTimerRef.current = null;
    }
  }, []);

  const closeMenu = React.useCallback(() => {
    clearFlyoutCloseTimer();
    setAnchorEl(null);
    setAccountAnchorEl(null);
  }, [clearFlyoutCloseTimer]);

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenu, open]);

  React.useEffect(() => () => clearFlyoutCloseTimer(), [clearFlyoutCloseTimer]);

  const handleToggleMenu = (event) => {
    setAnchorEl((current) => (current ? null : event.currentTarget));
    setAccountAnchorEl(null);
  };

  const handleClickAway = (event) => {
    if (flyoutRef.current?.contains(event.target)) {
      return;
    }

    closeMenu();
  };

  const openAccountFlyout = (event) => {
    clearFlyoutCloseTimer();
    setAccountAnchorEl(event.currentTarget);
  };

  const scheduleCloseAccountFlyout = () => {
    clearFlyoutCloseTimer();
    closeFlyoutTimerRef.current = window.setTimeout(() => {
      setAccountAnchorEl(null);
      closeFlyoutTimerRef.current = null;
    }, 120);
  };

  const handleAddAccount = () => {
    closeMenu();
    onAddAccount?.();
  };

  const profileButton = (
    <Stack
      component="button"
      type="button"
      direction="row"
      alignItems="center"
      spacing={1}
      onClick={handleToggleMenu}
      aria-haspopup="menu"
      aria-expanded={open ? 'true' : undefined}
      sx={{
        width: '100%',
        minHeight: collapsed ? 40 : 44,
        border: 0,
        borderRadius: '8px',
        backgroundColor: open ? 'action.selected' : 'transparent',
        color: 'text.primary',
        cursor: 'pointer',
        px: collapsed ? 0 : 0,
        py: 0,
        justifyContent: collapsed ? 'center' : 'flex-start',
        font: 'inherit',
        transition: 'background-color 150ms ease',
        '&:hover': {
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'action.hover'),
        },
      }}
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: '#2d6a2d',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {user.initials}
      </Avatar>
      {!collapsed ? (
        <>
          <Box sx={{ minWidth: 0, flexGrow: 1, textAlign: 'left' }}>
            <Typography
              variant="body2"
              noWrap
              sx={{
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.25,
                color: (theme) => (theme.palette.mode === 'dark' ? '#fff' : 'text.primary'),
              }}
            >
              {user.name}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{
                display: 'block',
                fontSize: 11,
                lineHeight: 1.35,
                color: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.52)' : 'text.secondary'),
              }}
            >
              {planLabel}
            </Typography>
          </Box>
        </>
      ) : null}
    </Stack>
  );

  return (
    <>
      {collapsed ? (
        <Tooltip title={user.name} placement="right">
          {profileButton}
        </Tooltip>
      ) : (
        profileButton
      )}

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="top-start"
        transition
        disablePortal={false}
        modifiers={[
          { name: 'offset', options: { offset: [0, 8] } },
          { name: 'preventOverflow', options: { padding: 12 } },
        ]}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} timeout={160} style={{ transformOrigin: 'bottom left' }}>
            <Box sx={{ transformOrigin: 'bottom left' }}>
              <ClickAwayListener onClickAway={handleClickAway}>
                <Paper
                  ref={menuRef}
                  elevation={8}
                  role="menu"
                  sx={{
                    width: 288,
                    p: 0.75,
                    borderRadius: '12px',
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: (theme) => theme.shadows[8],
                    transformOrigin: 'bottom left',
                  }}
                >
                  <AccountRow
                    user={user}
                    onMouseEnter={openAccountFlyout}
                    onMouseLeave={scheduleCloseAccountFlyout}
                  />
                  <Divider sx={{ my: 0.75 }} />
                  <MenuItem icon={<Sparkles size={17} />} label="Upgrade plan" />
                  <MenuItem icon={<User size={17} />} label="Profile" />
                  <MenuItem icon={<Settings size={17} />} label="Settings" />
                  <MenuItem icon={<CircleHelp size={17} />} label="Help" endIcon={<ChevronRight size={16} />} />
                  <Divider sx={{ my: 0.75 }} />
                  <MenuItem icon={<LogOut size={17} />} label="Log out" onClick={onLogout} />
                </Paper>
              </ClickAwayListener>
            </Box>
          </Grow>
        )}
      </Popper>

      <Popper
        open={accountFlyoutOpen}
        anchorEl={accountAnchorEl}
        placement="right-start"
        transition
        disablePortal={false}
        modifiers={[
          { name: 'offset', options: { offset: [8, -8] } },
          { name: 'preventOverflow', options: { padding: 12 } },
        ]}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} timeout={140} style={{ transformOrigin: 'left top' }}>
            <Paper
              ref={flyoutRef}
              elevation={8}
              onMouseEnter={clearFlyoutCloseTimer}
              onMouseLeave={scheduleCloseAccountFlyout}
              sx={{
                width: 280,
                p: 0.75,
                borderRadius: '12px',
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: (theme) => theme.shadows[8],
              }}
            >
              <Stack spacing={0.35} sx={{ px: '14px', py: '10px' }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                  {user.email}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ flexGrow: 1 }}>
                    {user.name}
                  </Typography>
                  <Check size={15} />
                </Stack>
              </Stack>
              <Divider sx={{ my: 0.75 }} />
              <MenuItem icon={<Plus size={17} />} label="Add account" onClick={handleAddAccount} />
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
