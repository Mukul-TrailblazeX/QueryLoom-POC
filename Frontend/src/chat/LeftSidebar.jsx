import * as React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  FolderClosed,
  FolderOpen,
  MessageCircle,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Search,
  X,
} from 'lucide-react';
import Brand from '../components/brand';
import ChatActionMenu from './ChatActionMenu';
import SidebarUserProfile from './SidebarUserProfile';

const hoverBg = (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)');
const activeBg = (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)');

function SidebarToggleIcon() {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      sx={{ width: 20, height: 20, color: 'text.secondary' }}
    >
      <Box
        component="path"
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <Box
        component="path"
        d="M9 4v16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </Box>
  );
}

function NavItem({ icon, label, active = false, onClick, collapsed, tooltip }) {
  const item = (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : '12px',
        minHeight: 36,
        padding: collapsed ? '8px 0' : '6px 12px',
        width: '100%',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: '8px',
        cursor: 'pointer',
        color: 'text.primary',
        backgroundColor: active ? activeBg : 'transparent',
        transition: 'background 150ms ease',
        '&:hover': {
          backgroundColor: hoverBg,
        },
      }}
    >
      <Box sx={{ width: 18, minWidth: 18, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icon}</Box>
      {!collapsed ? (
        <Typography variant="body2" noWrap sx={{ fontSize: 14, fontWeight: 400, lineHeight: '20px' }}>
          {label}
        </Typography>
      ) : null}
    </Box>
  );

  return collapsed ? <Tooltip title={tooltip || label} placement="right">{item}</Tooltip> : item;
}

function SectionLabel({ children }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        display: 'block',
        px: '12px',
        pt: '16px',
        pb: '4px',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.52)' : 'text.secondary'),
      }}
    >
      {children}
    </Typography>
  );
}

function ChatRow({
  chat,
  isActive,
  menuOpen,
  isRenaming,
  onSelect,
  onMenuOpen,
  onRenameSave,
  onRenameCancel,
}) {
  const [draftTitle, setDraftTitle] = React.useState(chat.title);
  const inputRef = React.useRef(null);
  const isUntitled = chat.title === 'New Chat' || chat.title === 'Untitled';

  React.useEffect(() => {
    setDraftTitle(chat.title);
  }, [chat.title]);

  React.useEffect(() => {
    if (isRenaming) {
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isRenaming]);

  const saveRename = () => {
    const nextTitle = draftTitle.trim() || 'Untitled';
    onRenameSave(chat.id, nextTitle);
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      onClick={() => {
        if (!isRenaming) {
          onSelect(chat.id);
        }
      }}
      sx={{
        position: 'relative',
        height: 36,
        maxHeight: 36,
        px: '10px',
        py: '6px',
        mx: '1px',
        borderRadius: '8px',
        cursor: isRenaming ? 'text' : 'pointer',
        backgroundColor: isActive || menuOpen ? activeBg : 'transparent',
        transition: 'background 150ms ease',
        '&:hover': {
          backgroundColor: hoverBg,
        },
        '&:hover .chat-more': {
          opacity: 1,
          pointerEvents: 'auto',
        },
      }}
    >
      {isRenaming ? (
        <InputBase
          inputRef={inputRef}
          value={draftTitle}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => setDraftTitle(event.target.value)}
          onBlur={saveRename}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              saveRename();
            }

            if (event.key === 'Escape') {
              event.preventDefault();
              setDraftTitle(chat.title);
              onRenameCancel();
            }
          }}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            fontSize: 14,
            fontWeight: 400,
            lineHeight: '20px',
            height: 24,
          }}
        />
      ) : (
        <Typography
          variant="body2"
          noWrap
          sx={{
            flexGrow: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 14,
            fontWeight: 400,
            lineHeight: '20px',
            color: isUntitled ? 'text.secondary' : 'text.primary',
          }}
        >
          {isUntitled ? 'Untitled' : chat.title}
        </Typography>
      )}
      <IconButton
        size="small"
        className="chat-more"
        onClick={(event) => onMenuOpen(event, chat.id)}
        aria-label={`Open options for ${chat.title}`}
        sx={{
          width: 24,
          height: 24,
          flexShrink: 0,
          alignSelf: 'center',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          color: 'text.secondary',
          transition: 'opacity 150ms ease',
          '&:hover': {
            backgroundColor: hoverBg,
          },
        }}
      >
        <MoreHorizontal size={16} />
      </IconButton>
    </Stack>
  );
}

export default function LeftSidebar({
  chats,
  activeChatId,
  renamingChatId,
  onNewChat,
  onSelectChat,
  onSearch,
  onChatHome,
  onAllChats,
  onToggleKnowledgeBase,
  onToggleStar,
  onStartRename,
  onRenameChat,
  onCancelRename,
  onRequestMove,
  onRequestDelete,
  user,
  collapsed,
  onToggleCollapsed,
  onLogout,
  onAddAccount,
  isMobile = false,
  onCloseMobile,
}) {
  const [chatMenuAnchor, setChatMenuAnchor] = React.useState(null);
  const [chatMenuId, setChatMenuId] = React.useState(null);
  const menuChat = chats.find((chat) => chat.id === chatMenuId);
  const starredChats = chats.filter((chat) => chat.isStarred);
  const recentChats = chats.filter((chat) => !chat.isStarred);

  const handleChatMenuOpen = (event, chatId) => {
    event.stopPropagation();
    setChatMenuAnchor(event.currentTarget);
    setChatMenuId(chatId);
  };

  const handleChatMenuClose = () => {
    setChatMenuAnchor(null);
    setChatMenuId(null);
  };

  const renderChatRows = (sectionChats) => sectionChats.map((chat) => (
    <ChatRow
      key={chat.id}
      chat={chat}
      isActive={chat.id === activeChatId}
      menuOpen={chat.id === chatMenuId}
      isRenaming={chat.id === renamingChatId}
      onSelect={onSelectChat}
      onMenuOpen={handleChatMenuOpen}
      onRenameSave={onRenameChat}
      onRenameCancel={onCancelRename}
    />
  ));

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
          width: collapsed ? 48 : 260,
        borderRadius: 0,
        borderRight: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        overflow: 'hidden',
        transition: 'width 300ms ease',
      }}
    >
      {collapsed ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            minHeight: 0,
            py: 1,
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
            <Tooltip title="Expand sidebar" placement="right">
              <IconButton size="small" onClick={onToggleCollapsed} sx={{ width: 36, height: 36 }}>
                <SidebarToggleIcon />
              </IconButton>
            </Tooltip>
            <NavItem icon={<Plus size={20} />} label="New chat" onClick={onNewChat} collapsed />
            <NavItem icon={<Search size={20} />} label="Search" onClick={onSearch} collapsed />
            <NavItem icon={<MessageCircle size={20} />} label="Chats" onClick={onAllChats} collapsed />
            <NavItem icon={<FolderOpen size={20} />} label="Knowledge Base" onClick={onToggleKnowledgeBase} collapsed />
          </Box>
          <Box
            sx={{
              marginTop: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              pb: 2,
            }}
          >
            <Box sx={{ width: '100%', px: 0.75 }}>
              <SidebarUserProfile user={user} collapsed onLogout={onLogout} onAddAccount={onAddAccount} />
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 2.5, flexShrink: 0 }}>
            <Box
              component="button"
              type="button"
              onClick={onChatHome}
              aria-label="Open chat home"
              sx={{
                border: 0,
                p: 0,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Brand />
            </Box>
            <Stack direction="row" spacing={0.25} sx={{ ml: 'auto', alignItems: 'center' }}>
              <Tooltip title="Collapse sidebar">
                <IconButton size="small" onClick={onToggleCollapsed}>
                  <SidebarToggleIcon />
                </IconButton>
              </Tooltip>
              {isMobile ? (
                <Tooltip title="Close sidebar">
                  <IconButton size="small" onClick={onCloseMobile}>
                    <X size={18} />
                  </IconButton>
                </Tooltip>
              ) : null}
            </Stack>
          </Stack>

          <Stack spacing="2px" sx={{ px: 2, pb: 1, flexShrink: 0 }}>
            <NavItem icon={<Plus size={18} />} label="New chat" onClick={onNewChat} />
            <NavItem icon={<Search size={18} />} label="Search" onClick={onSearch} />
            <NavItem icon={<MessageSquareText size={18} />} label="Chats" onClick={onAllChats} />
            <NavItem icon={<FolderClosed size={18} />} label="Knowledge Base" onClick={onToggleKnowledgeBase} />
          </Stack>

          <Divider sx={{ flexShrink: 0 }} />

          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', px: 2, py: 0 }}>
            {starredChats.length > 0 ? (
              <>
                <SectionLabel>Starred</SectionLabel>
                <Stack spacing="2px">{renderChatRows(starredChats)}</Stack>
              </>
            ) : null}
            <SectionLabel>Recents</SectionLabel>
            <Stack spacing="2px">{renderChatRows(recentChats)}</Stack>
            <Box sx={{ mt: 1.25 }}>
              <NavItem icon={<MessageCircle size={18} />} label="All chats" onClick={onAllChats} />
            </Box>
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              p: '12px',
              borderTop: '1px solid',
              borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'divider'),
            }}
          >
            <SidebarUserProfile user={user} planLabel="Free" onLogout={onLogout} onAddAccount={onAddAccount} />
          </Box>
        </Box>
      )}
      <ChatActionMenu
        anchorEl={chatMenuAnchor}
        open={Boolean(chatMenuAnchor)}
        chat={menuChat}
        onClose={handleChatMenuClose}
        onToggleStar={onToggleStar}
        onRename={onStartRename}
        onMove={onRequestMove}
        onDelete={onRequestDelete}
      />
    </Paper>
  );
}
