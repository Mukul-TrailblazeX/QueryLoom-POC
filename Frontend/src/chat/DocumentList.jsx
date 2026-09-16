import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { FileAudio, FileImage, FileText, FileType2, Trash2, UploadCloud } from 'lucide-react';

function getDocumentIcon(type) {
  switch (type) {
    case 'pdf':
      return { icon: <FileType2 size={18} />, color: '#d64545', background: 'rgba(214, 69, 69, 0.12)' };
    case 'txt':
      return { icon: <FileText size={18} />, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.12)' };
    case 'audio':
      return { icon: <FileAudio size={18} />, color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.12)' };
    case 'image':
      return { icon: <FileImage size={18} />, color: '#ea580c', background: 'rgba(234, 88, 12, 0.12)' };
    default:
      return { icon: <FileText size={18} />, color: '#64748b', background: 'rgba(100, 116, 139, 0.12)' };
  }
}

export default function DocumentList({ documents, onToggle, onRemove }) {
  if (documents.length === 0) {
    return (
      <Stack
        spacing={1}
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: 320,
          px: 3,
          py: 4,
          borderRadius: 4,
          border: '1px dashed',
          borderColor: 'divider',
          color: 'text.secondary',
          textAlign: 'center',
        }}
      >
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 84,
            height: 84,
            borderRadius: '50%',
            backgroundColor: 'action.hover',
            color: '#2d6a4f',
          }}
        >
          <UploadCloud size={34} />
        </Stack>
        <Typography variant="body1" fontWeight={600}>
          Start building your knowledge base
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload PDF, TXT, audio, or image files and they&apos;ll appear here automatically.
        </Typography>
      </Stack>
    );
  }

  return (
    <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
      {documents.map((document) => {
        const iconConfig = getDocumentIcon(document.type);

        return (
          <ListItem
            key={document.id}
            disablePadding
            secondaryAction={
              <Tooltip title="Remove document">
                <IconButton
                  edge="end"
                  aria-label={`Remove ${document.name}`}
                  onClick={() => onRemove(document.id)}
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': { color: '#d64545', backgroundColor: 'rgba(214, 69, 69, 0.08)' },
                  }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Tooltip>
            }
            sx={{
              px: 1.4,
              py: 1.1,
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                borderColor: 'rgba(45, 106, 79, 0.24)',
                backgroundColor: 'rgba(45, 106, 79, 0.04)',
              },
            }}
          >
            <Checkbox
              checked={document.selected}
              onChange={() => onToggle(document.id)}
              edge="start"
              sx={{
                mr: 0.75,
                color: 'rgba(45, 106, 79, 0.4)',
                '&.Mui-checked': { color: '#2d6a4f' },
              }}
            />
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, pr: 5 }}>
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  backgroundColor: iconConfig.background,
                  color: iconConfig.color,
                }}
              >
                {iconConfig.icon}
              </Stack>
              <ListItemText
                primary={document.name}
                secondary={
                  <Stack spacing={0.15}>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {document.meta}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {document.sizeLabel}
                    </Typography>
                  </Stack>
                }
                primaryTypographyProps={{ noWrap: true, fontWeight: 600 }}
              />
            </Stack>
          </ListItem>
        );
      })}
    </List>
  );
}
