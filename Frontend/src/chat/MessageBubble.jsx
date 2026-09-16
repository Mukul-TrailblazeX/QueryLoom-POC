import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ReactMarkdown from 'react-markdown';

export default function MessageBubble({
  message,
  isPlaying,
  onSpeak,
  onStop,
  onCopy,
  isMobile = false,
}) {
  const isUser = message.role === 'user';
  const iconButtonSx = {
    width: 28,
    height: 28,
    color: 'text.secondary',
    transition: 'color 150ms ease',
    '&:hover': {
      color: '#2d6a4f',
      backgroundColor: 'transparent',
    },
  };

  return (
    <Fade in timeout={220}>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          '&:hover .assistant-actions': {
            opacity: 1,
          },
        }}
      >
        {!isUser ? (
          <Stack direction="row" spacing={1.25} sx={{ width: '100%', alignItems: 'flex-start', py: 1 }}>
            <Box
              aria-hidden="true"
              sx={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                bgcolor: '#2d6a2d',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
                mt: 0.35,
              }}
            >
              K
            </Box>
            <Stack spacing={1} sx={{ width: '100%', minWidth: 0, alignItems: 'flex-start' }}>
              <Box
                className="kriyanto-markdown prose prose-invert max-w-none"
                sx={{
                  color: 'text.primary',
                  fontSize: 15,
                  lineHeight: 1.7,
                  width: '100%',
                  maxWidth: '100%',
                }}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
              <Stack
                direction="row"
                spacing={1}
                className="assistant-actions"
                sx={{
                  opacity: isMobile ? 1 : 0,
                  transition: 'opacity 150ms ease',
                  alignItems: 'center',
                }}
              >
                <Tooltip title="Copy">
                  <IconButton size="small" onClick={onCopy} sx={iconButtonSx}>
                    <ContentCopyIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isPlaying ? 'Stop audio' : 'Read aloud'}>
                  <IconButton size="small" onClick={isPlaying ? onStop : onSpeak} sx={iconButtonSx}>
                    <VolumeUpIcon sx={{ fontSize: 18, color: isPlaying ? '#2d6a4f' : 'inherit' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Helpful">
                  <IconButton size="small" sx={iconButtonSx}>
                    <ThumbUpOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Not helpful">
                  <IconButton size="small" sx={iconButtonSx}>
                    <ThumbDownOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Regenerate">
                  <IconButton size="small" sx={iconButtonSx}>
                    <RefreshIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>
        ) : (
          <Box
            sx={{
              maxWidth: isMobile ? '85%' : '70%',
              px: '16px',
              py: '10px',
              borderRadius: '18px 18px 4px 18px',
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#2d6a2d' : '#2d6a2d'),
              color: '#fff',
            }}
          >
            <Typography
              sx={{
                color: '#fff',
                fontSize: 15,
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
              }}
            >
              {message.content}
            </Typography>
          </Box>
        )}
      </Box>
    </Fade>
  );
}
