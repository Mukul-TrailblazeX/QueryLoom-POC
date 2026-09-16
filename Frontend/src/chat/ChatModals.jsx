import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Search, X } from 'lucide-react';

export function DeleteChatDialog({ open, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            bgcolor: 'background.paper',
            color: 'text.primary',
          },
        },
      }}
    >
      <DialogTitle sx={{ fontSize: 18, fontWeight: 700, pb: 1 }}>Delete chat</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to delete this chat?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{
            bgcolor: '#d93025',
            color: '#fff',
            '&:hover': { bgcolor: '#b3261e' },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function MoveChatDialog({ open, onClose, projects = [] }) {
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const filteredProjects = projects.filter((project) =>
    project.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            bgcolor: 'background.paper',
            color: 'text.primary',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ px: 3, pt: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Move chat</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Select a project to move this chat into.
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Close move chat dialog">
          <X size={18} />
        </IconButton>
      </Stack>
      <DialogContent sx={{ pt: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            px: 1.25,
            py: 0.75,
            '&:focus-within': {
              borderColor: '#2563eb',
            },
          }}
        >
          <Search size={17} />
          <InputBase
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search or create a project"
            sx={{ flexGrow: 1, fontSize: 14 }}
          />
        </Stack>
        {filteredProjects.length > 0 ? (
          <Stack sx={{ mt: 2 }}>
            {filteredProjects.map((project) => (
              <Box
                key={project}
                component="button"
                type="button"
                onClick={onClose}
                sx={{
                  border: 0,
                  bgcolor: 'transparent',
                  color: 'text.primary',
                  textAlign: 'left',
                  px: 1.25,
                  py: 1,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {project}
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary" sx={{ py: 5, textAlign: 'center' }}>
            No projects available
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
