import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus, Search } from 'lucide-react';

function getLastMessageLabel(chat) {
  const source = chat.updatedAt || chat.createdAt;
  const date = source ? new Date(source) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return 'Last message recently';
  }

  const diffMinutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 60) {
    return `Last message ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `Last message ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `Last message ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

export default function ChatsListPage({ chats, onNewChat, onSelectChat }) {
  const [query, setQuery] = React.useState('');
  const filteredChats = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sortedChats = [...chats].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });

    if (!normalizedQuery) {
      return sortedChats;
    }

    return sortedChats.filter((chat) => chat.title.toLowerCase().includes(normalizedQuery));
  }, [chats, query]);

  return (
    <Box
      sx={{
        height: '100vh',
        overflow: 'hidden',
        px: { xs: 2, md: 6 },
        py: { xs: 3, md: 5 },
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Stack sx={{ height: '100%', maxWidth: 920, mx: 'auto', minHeight: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography component="h1" sx={{ fontSize: 32, fontWeight: 700, lineHeight: 1.15 }}>
            Chats
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={17} />}
            onClick={onNewChat}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#f5f5f5' : '#111'),
              color: (theme) => (theme.palette.mode === 'dark' ? '#111' : '#fff'),
              '&:hover': {
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#fff' : '#000'),
              },
            }}
          >
            New chat
          </Button>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            mt: 3,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            px: 1.5,
            py: 1,
            bgcolor: 'background.paper',
            '&:focus-within': {
              borderColor: '#2563eb',
            },
          }}
        >
          <Search size={18} />
          <InputBase
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your chats..."
            sx={{ flexGrow: 1, fontSize: 15 }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 3, mb: 1.5 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Your chats with Kriyanto</Typography>
          <Typography component="button" type="button" sx={{ border: 0, bgcolor: 'transparent', color: '#2563eb', cursor: 'pointer', fontSize: 14 }}>
            Select
          </Typography>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', borderTop: 1, borderColor: 'divider' }}>
          {filteredChats.map((chat) => (
            <Stack
              key={chat.id}
              component="button"
              type="button"
              onClick={() => onSelectChat(chat.id)}
              sx={{
                width: '100%',
                border: 0,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'transparent',
                color: 'text.primary',
                textAlign: 'left',
                px: 1,
                py: 1.75,
                cursor: 'pointer',
                transition: 'background 150ms ease',
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                },
              }}
            >
              <Typography noWrap sx={{ fontSize: 16, fontWeight: 500, lineHeight: '22px' }}>
                {chat.title === 'New Chat' ? 'Untitled' : chat.title}
              </Typography>
              <Typography color="text.secondary" noWrap sx={{ mt: 0.4, fontSize: 14 }}>
                {getLastMessageLabel(chat)}
              </Typography>
            </Stack>
          ))}
          {filteredChats.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 8, textAlign: 'center' }}>
              No chats found
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
}
