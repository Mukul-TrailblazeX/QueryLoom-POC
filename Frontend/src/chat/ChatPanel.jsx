import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import CompareIcon from '@mui/icons-material/Compare';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { ArrowUp, BarChart3, ChevronDown, Copy, FileAudio, FileImage, FileText, Globe2, Menu as MenuIcon, Moon, Paperclip, Share2, Sun, Upload } from 'lucide-react';
import { useTheme as useSiteTheme } from '../context/use-theme';
import ChatActionMenu from './ChatActionMenu';
import MessageBubble from './MessageBubble';

function TypingIndicator() {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      {[0, 1, 2].map((dot) => (
        <Box
          key={dot}
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: '#2d6a4f',
            animation: 'kriyanto-typing 900ms infinite ease-in-out',
            animationDelay: `${dot * 0.12}s`,
            '@keyframes kriyanto-typing': {
              '0%, 80%, 100%': { transform: 'translateY(0)', opacity: 0.35 },
              '40%': { transform: 'translateY(-4px)', opacity: 1 },
            },
          }}
        />
      ))}
    </Stack>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function EmptyState({ onSuggestionClick, onFocusInput, firstName, isMobile }) {
  const prompts = [
    { label: 'Summarize a document', icon: <DocumentScannerIcon sx={{ fontSize: 18 }} /> },
    { label: 'Compare two files', icon: <CompareIcon sx={{ fontSize: 18 }} /> },
    { label: 'Extract key insights', icon: <LightbulbOutlinedIcon sx={{ fontSize: 18 }} /> },
  ];

  return (
    <Stack
      alignItems="center"
      spacing={2}
      sx={{
        width: '100%',
        maxWidth: 680,
        mx: 'auto',
        textAlign: 'center',
      }}
    >
      <Typography
        color="text.primary"
        sx={{
          fontSize: { xs: 28, md: 32 },
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        {getGreeting()}, {firstName}
      </Typography>
      <Stack direction={isMobile ? 'column' : 'row'} spacing={1} sx={{ width: '100%', justifyContent: 'center' }}>
        {prompts.map((prompt) => (
          <Chip
            key={prompt.label}
            icon={prompt.icon}
            label={prompt.label}
            clickable
            onClick={() => {
              onSuggestionClick(prompt.label);
              onFocusInput();
            }}
            sx={{
              height: 36,
              borderRadius: 999,
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center',
              border: '1px solid rgba(0,0,0,0.12)',
              backgroundColor: 'transparent',
              transition: 'all 150ms ease',
              '&:hover': {
                borderColor: 'rgba(45, 106, 79, 0.35)',
                backgroundColor: 'rgba(45, 106, 79, 0.04)',
              },
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}

function ChatLoadingState() {
  return (
    <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 760, mx: 'auto' }}>
      <Skeleton variant="rounded" width={220} height={24} />
      <Stack spacing={1.25}>
        <Skeleton variant="text" width="88%" height={26} />
        <Skeleton variant="text" width="76%" height={26} />
        <Skeleton variant="text" width="64%" height={26} />
      </Stack>
      <Stack spacing={1.25} alignItems="flex-end">
        <Skeleton variant="rounded" width="62%" height={48} />
      </Stack>
      <Stack spacing={1.25}>
        <Skeleton variant="text" width="82%" height={26} />
        <Skeleton variant="text" width="58%" height={26} />
      </Stack>
    </Stack>
  );
}

export default function ChatPanel({
  activeChat,
  draft,
  onDraftChange,
  onSendMessage,
  onUploadFiles,
  onSpeakMessage,
  onStopSpeaking,
  onCopyMessage,
  speakingMessageId,
  isAssistantTyping,
  onToggleStar,
  onStartRename,
  onRequestMove,
  onRequestDelete,
  onOpenShare,
  onOpenMobileSidebar,
  user,
  isHistoryLoading = false,
  historyError = '',
  onRetryHistory,
  isMobile = false,
}) {
  const [uploadMenuAnchor, setUploadMenuAnchor] = React.useState(null);
  const [titleMenuAnchor, setTitleMenuAnchor] = React.useState(null);
  const muiTheme = useMuiTheme();
  const { toggleTheme } = useSiteTheme();
  const isDarkMode = muiTheme.palette.mode === 'dark';
  const pdfInputRef = React.useRef(null);
  const textInputRef = React.useRef(null);
  const audioInputRef = React.useRef(null);
  const imageInputRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);
  const composerInputRef = React.useRef(null);
  const hasMessages = activeChat.messages.length > 0 || isAssistantTyping;
  const firstName = user.name.split(' ')[0] || user.name;

  React.useEffect(() => {
    if (hasMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [activeChat.messages, hasMessages, isAssistantTyping]);

  React.useEffect(() => {
    if (!hasMessages && !isHistoryLoading) {
      window.requestAnimationFrame(() => {
        composerInputRef.current?.focus();
      });
    }
  }, [activeChat.id, hasMessages, isHistoryLoading]);

  React.useEffect(() => {
    const textarea = composerInputRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 135)}px`;
  }, [draft]);

  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onUploadFiles(files);
    }
    event.target.value = '';
    setUploadMenuAnchor(null);
  };

  const triggerInput = (ref) => {
    ref.current?.click();
  };

  const uploadControls = (
    <>
      <input ref={pdfInputRef} hidden type="file" accept=".pdf" multiple onChange={handleFileSelection} />
      <input ref={textInputRef} hidden type="file" accept=".txt,text/plain" multiple onChange={handleFileSelection} />
      <input ref={audioInputRef} hidden type="file" accept="audio/*" multiple onChange={handleFileSelection} />
      <input ref={imageInputRef} hidden type="file" accept="image/*" multiple onChange={handleFileSelection} />
      <Menu anchorEl={uploadMenuAnchor} open={Boolean(uploadMenuAnchor)} onClose={() => setUploadMenuAnchor(null)}>
        <MenuItem onClick={() => triggerInput(pdfInputRef)}><FileText size={16} style={{ marginRight: 10 }} />Upload PDF</MenuItem>
        <MenuItem onClick={() => triggerInput(textInputRef)}><Upload size={16} style={{ marginRight: 10 }} />Upload Text</MenuItem>
        <MenuItem onClick={() => triggerInput(audioInputRef)}><FileAudio size={16} style={{ marginRight: 10 }} />Upload Audio (max 5min)</MenuItem>
        <MenuItem onClick={() => triggerInput(imageInputRef)}><FileImage size={16} style={{ marginRight: 10 }} />Upload Image</MenuItem>
      </Menu>
    </>
  );

  const composer = (
    <Stack sx={{ width: '100%', maxWidth: 760, mx: 'auto', alignItems: 'center' }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          px: 2,
          py: 1.5,
          borderRadius: '16px',
          border: '1px solid',
          borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'),
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff'),
          boxShadow: (theme) =>
            theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.22)' : '0 2px 12px rgba(0,0,0,0.08)',
        }}
      >
        <Box
          component="textarea"
          ref={composerInputRef}
          rows={1}
          placeholder="Ask anything..."
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSendMessage();
            }
          }}
          sx={{
            width: '100%',
            maxHeight: 135,
            resize: 'none',
            border: 0,
            outline: 0,
            p: 0,
            mb: 1.25,
            fontFamily: 'inherit',
            fontSize: 15,
            lineHeight: 1.5,
            color: 'text.primary',
            backgroundColor: 'transparent',
            overflowY: 'auto',
            '&::placeholder': {
              color: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : theme.palette.text.secondary),
            },
          }}
        />
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Tooltip title="Add files">
            <IconButton
              onClick={(event) => setUploadMenuAnchor(event.currentTarget)}
              sx={{
                width: 32,
                height: 32,
                color: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : theme.palette.text.secondary),
                borderRadius: '8px',
                '&:hover': {
                  color: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#2d6a4f'),
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              }}
            >
              <Paperclip size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Search the web">
            <IconButton
              sx={{
                width: 32,
                height: 32,
                color: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : theme.palette.text.secondary),
                borderRadius: '8px',
                '&:hover': {
                  color: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#2d6a4f'),
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              }}
            >
              <Globe2 size={20} />
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            onClick={onSendMessage}
            disabled={!draft.trim()}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              visibility: draft.trim() ? 'visible' : 'hidden',
              bgcolor: draft.trim() ? '#2d6a4f' : 'rgba(0,0,0,0.12)',
              color: draft.trim() ? '#fff' : 'rgba(0,0,0,0.38)',
              transition: 'background 150ms ease',
              '&:hover': {
                bgcolor: draft.trim() ? '#255640' : 'rgba(0,0,0,0.12)',
              },
              '&.Mui-disabled': {
                color: 'rgba(0,0,0,0.38)',
              },
            }}
          >
            <ArrowUp size={15} />
          </IconButton>
        </Stack>
      </Paper>
      <Typography color="text.secondary" sx={{ mt: 1, fontSize: 12, textAlign: 'center' }}>
        Kriyanto can make mistakes. Check important info.
      </Typography>
    </Stack>
  );

  return (
    <Stack
      className="chat-layout"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {uploadControls}
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          height: 52,
          flexShrink: 0,
          px: { xs: 1.5, md: 2.5 },
        }}
      >
        <Box sx={{ width: 40 }}>
          {isMobile ? (
            <IconButton onClick={onOpenMobileSidebar}>
              <MenuIcon size={20} />
            </IconButton>
          ) : null}
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0, px: 1 }}>
          {hasMessages ? (
            <Box
              component="button"
              type="button"
              onClick={(event) => setTitleMenuAnchor(event.currentTarget)}
              sx={{
                maxWidth: 'min(520px, 100%)',
                border: 0,
                bgcolor: 'transparent',
                color: 'text.primary',
                cursor: 'pointer',
                borderRadius: '10px',
                px: 1,
                py: 0.75,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                transition: 'background 150ms ease',
                '&:hover': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              }}
            >
              <Typography
                variant="body2"
                noWrap
                sx={{ fontSize: 14, fontWeight: 500, minWidth: 0, lineHeight: '20px', flexShrink: 1 }}
              >
                {activeChat.title === 'New Chat' ? 'Untitled' : activeChat.title}
              </Typography>
              <ChevronDown size={15} />
            </Box>
          ) : null}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {isDarkMode ? (
            <Tooltip title="Copy share link">
              <IconButton
                onClick={onOpenShare}
                sx={{
                  width: 36,
                  height: 36,
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#fff',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                }}
              >
                <Copy size={16} />
              </IconButton>
            </Tooltip>
          ) : null}
          <Button
            variant={isDarkMode ? 'contained' : 'outlined'}
            size="small"
            startIcon={isDarkMode ? <Share2 size={15} /> : <BarChart3 size={15} />}
            onClick={onOpenShare}
            sx={{
              borderRadius: isDarkMode ? '20px' : '8px',
              textTransform: 'none',
              px: isDarkMode ? '14px' : '14px',
              py: '8px',
              minHeight: 36,
              fontSize: 14,
              fontWeight: 500,
              lineHeight: '20px',
              bgcolor: isDarkMode ? '#3d8c40' : 'transparent',
              color: isDarkMode ? '#fff' : 'text.secondary',
              border: isDarkMode ? 'none' : '1px solid rgba(0,0,0,0.15)',
              '&:hover': {
                bgcolor: isDarkMode ? '#347a37' : 'rgba(0,0,0,0.05)',
                border: isDarkMode ? 'none' : '1px solid rgba(0,0,0,0.15)',
              },
            }}
          >
            Share
          </Button>
          {isDarkMode ? (
            <Tooltip title="Dark mode">
              <IconButton
                onClick={toggleTheme}
                sx={{
                  width: 36,
                  height: 36,
                  color: '#fff',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                }}
              >
                <Sun size={20} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Light mode">
              <IconButton
                onClick={toggleTheme}
                sx={{
                  width: 36,
                  height: 36,
                  color: 'text.primary',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.06)' },
                }}
              >
                <Moon size={20} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
      <ChatActionMenu
        anchorEl={titleMenuAnchor}
        open={Boolean(titleMenuAnchor)}
        chat={activeChat}
        onClose={() => setTitleMenuAnchor(null)}
        onToggleStar={onToggleStar}
        onRename={onStartRename}
        onMove={onRequestMove}
        onDelete={onRequestDelete}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      />

      <Box
        className="messages-area"
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: { xs: 2, md: 3 },
          py: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack sx={{ maxWidth: 760, mx: 'auto', minHeight: '100%', width: '100%' }}>
          {isHistoryLoading ? (
            <Box
              sx={{
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <ChatLoadingState />
            </Box>
          ) : !hasMessages ? (
            <Box
              sx={{
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pb: { xs: 10, md: 12 },
              }}
            >
              <Stack spacing={3} sx={{ width: '100%', alignItems: 'center' }}>
                {historyError ? (
                  <Stack spacing={1.25} alignItems="center" sx={{ width: '100%', maxWidth: 680 }}>
                    <Typography color="text.secondary" sx={{ fontSize: 14, textAlign: 'center' }}>
                      {historyError}
                    </Typography>
                    <Button variant="outlined" onClick={onRetryHistory}>
                      Retry
                    </Button>
                  </Stack>
                ) : null}
                <EmptyState
                  onSuggestionClick={onDraftChange}
                  onFocusInput={() => composerInputRef.current?.focus()}
                  firstName={firstName}
                  isMobile={isMobile}
                />
              </Stack>
            </Box>
          ) : (
            <Stack spacing={3} sx={{ width: '100%' }}>
              {activeChat.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isPlaying={speakingMessageId === message.id}
                  onSpeak={() => onSpeakMessage(message)}
                  onStop={onStopSpeaking}
                  onCopy={() => onCopyMessage(message)}
                  isMobile={isMobile}
                />
              ))}

              {isAssistantTyping ? (
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <TypingIndicator />
                </Stack>
              ) : null}
              <Box ref={messagesEndRef} />
            </Stack>
          )}
        </Stack>
      </Box>

      <Box
        className="input-footer"
        sx={{
          flexShrink: 0,
          px: { xs: 2, md: 3 },
          pt: 2,
          pb: { xs: 2, md: 3 },
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        {composer}
      </Box>
    </Stack>
  );
}
