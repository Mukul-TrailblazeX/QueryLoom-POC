import * as React from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MessageSquareText, Search, X } from 'lucide-react';

function getRelativeTimestamp(chat) {
  const source = chat.updatedAt || chat.createdAt;
  const date = source ? new Date(source) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return 'Recent';
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfToday - startOfDate) / 86400000);

  if (dayDiff <= 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';
  if (dayDiff < 7) return 'Past week';
  if (dayDiff < 30) return 'Past month';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ChatSearchModal({ open, chats, activeChatId, onClose, onSelectChat }) {
  const [query, setQuery] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const inputRef = React.useRef(null);

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

  React.useEffect(() => {
    if (!open) {
      setQuery('');
      setHighlightedIndex(0);
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (filteredChats.length === 0) {
        return;
      }
      setHighlightedIndex((current) => Math.min(current + 1, filteredChats.length - 1));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (filteredChats.length === 0) {
        return;
      }
      setHighlightedIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === 'Enter' && filteredChats[highlightedIndex]) {
      event.preventDefault();
      onSelectChat(filteredChats[highlightedIndex].id);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.68)',
            backdropFilter: 'blur(4px)',
          },
        },
        paper: {
          sx: {
            mt: -16,
            borderRadius: 3,
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: (theme) => theme.shadows[12],
          },
        },
      }}
    >
      <Stack onKeyDown={handleKeyDown}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}
        >
          <Search size={18} />
          <InputBase
            inputRef={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chats and projects"
            sx={{ flexGrow: 1, fontSize: 16 }}
          />
          <IconButton size="small" onClick={onClose} aria-label="Close search">
            <X size={18} />
          </IconButton>
        </Stack>

        <Stack sx={{ maxHeight: 420, overflowY: 'auto', p: 1 }}>
          {filteredChats.length > 0 ? (
            filteredChats.map((chat, index) => {
              const selected = chat.id === activeChatId;
              const highlighted = index === highlightedIndex;

              return (
                <Stack
                  key={chat.id}
                  direction="row"
                  alignItems="center"
                  spacing={1.25}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => {
                    onSelectChat(chat.id);
                    onClose();
                  }}
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2,
                    cursor: 'pointer',
                    backgroundColor: highlighted || selected ? 'action.hover' : 'transparent',
                    transition: 'background-color 150ms ease, color 150ms ease',
                  }}
                >
                  <Box sx={{ color: 'text.secondary', display: 'grid', placeItems: 'center' }}>
                    <MessageSquareText size={18} />
                  </Box>
                  <Typography variant="body2" noWrap sx={{ flexGrow: 1, minWidth: 0, fontWeight: selected ? 600 : 500 }}>
                    {chat.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {getRelativeTimestamp(chat)}
                  </Typography>
                </Stack>
              );
            })
          ) : (
            <Typography color="text.secondary" sx={{ px: 1.5, py: 3, textAlign: 'center' }}>
              No chats found
            </Typography>
          )}
        </Stack>
      </Stack>
    </Dialog>
  );
}
