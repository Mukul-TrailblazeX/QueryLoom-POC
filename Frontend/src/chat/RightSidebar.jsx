import * as React from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { FileAudio, FileImage, FileText, FileType2, Trash2, UploadCloud, X } from 'lucide-react';
import FileUploadButton from './FileUploadButton';

function getIconMeta(type) {
  switch (type) {
    case 'pdf':
      return { icon: <FileType2 size={18} />, color: '#d64545' };
    case 'txt':
      return { icon: <FileText size={18} />, color: '#3b82f6' };
    case 'audio':
      return { icon: <FileAudio size={18} />, color: '#8b5cf6' };
    case 'image':
      return { icon: <FileImage size={18} />, color: '#ea580c' };
    default:
      return { icon: <FileText size={18} />, color: '#64748b' };
  }
}

export default function RightSidebar({
  documents,
  onUploadFiles,
  onToggleDocument,
  onRemoveDocument,
  onClose,
  isMobile = false,
}) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files || []);
    if (files.length > 0) {
      onUploadFiles(files);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        width: '100%',
        borderRadius: isMobile ? '20px 20px 0 0' : 0,
        borderLeft: isMobile ? 'none' : '1px solid rgba(0,0,0,0.08)',
        backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1a1a1a' : '#f0f0ec'),
        boxShadow: 'none',
        overflow: 'hidden',
      }}
    >
      <Stack spacing={2} sx={{ p: 2, height: '100%', minHeight: 0, overflow: 'hidden' }}>
        {isMobile ? (
          <Box
            sx={{
              width: 36,
              height: 4,
              borderRadius: 999,
              bgcolor: 'rgba(0,0,0,0.18)',
              mx: 'auto',
              mt: 0.5,
            }}
          />
        ) : null}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ flexShrink: 0 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Knowledge Base
          </Typography>
          <IconButton onClick={onClose}>
            <X size={17} />
          </IconButton>
        </Stack>

        <Box
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          sx={{
            border: '1px dashed',
            borderColor: isDragging ? '#2d6a4f' : 'rgba(45, 106, 79, 0.24)',
            borderRadius: '18px',
            p: 2,
            textAlign: 'center',
            backgroundColor: isDragging ? 'rgba(45, 106, 79, 0.08)' : 'rgba(45, 106, 79, 0.03)',
            transition: 'all 150ms ease',
          }}
        >
          <Stack spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                backgroundColor: 'rgba(45, 106, 79, 0.1)',
                color: '#2d6a4f',
              }}
            >
              <UploadCloud size={22} />
            </Box>
            <Stack spacing={0.3}>
              <Typography variant="body2" fontWeight={600}>
                Drag and drop files here
              </Typography>
              <Typography variant="caption" color="text.secondary">
                or click to upload
              </Typography>
            </Stack>
            <FileUploadButton
              accept=".pdf,.txt,audio/*,image/*"
              icon={<UploadCloud size={16} />}
              label="Upload files"
              onFilesSelected={onUploadFiles}
              variant="outlined"
            />
          </Stack>
        </Box>

        <Stack spacing={1} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          {documents.map((document) => {
            const iconMeta = getIconMeta(document.type);

            return (
              <Stack
                key={document.id}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  px: 1.2,
                  py: 1,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  transition: 'all 150ms ease',
                  '&:hover': {
                    backgroundColor: 'rgba(45, 106, 79, 0.08)',
                  },
                  '&:hover .doc-delete': {
                    opacity: 1,
                  },
                }}
              >
                <Box sx={{ color: iconMeta.color, display: 'grid', placeItems: 'center' }}>{iconMeta.icon}</Box>
                <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {document.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {document.sizeLabel}
                  </Typography>
                </Stack>
                <Tooltip title="Delete document">
                  <IconButton
                    size="small"
                    className="doc-delete"
                    onClick={() => onRemoveDocument(document.id)}
                    sx={{
                      opacity: 0,
                      transition: 'opacity 150ms ease, color 150ms ease',
                      '&:hover': { color: '#d64545' },
                    }}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </Tooltip>
                <Checkbox
                  checked={document.selected}
                  onChange={() => onToggleDocument(document.id)}
                  sx={{
                    color: 'rgba(45, 106, 79, 0.35)',
                    '&.Mui-checked': { color: '#2d6a4f' },
                  }}
                />
              </Stack>
            );
          })}
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
          All new documents selected by default
        </Typography>
      </Stack>
    </Paper>
  );
}
