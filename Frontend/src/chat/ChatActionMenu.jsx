import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { FolderPlus, Pencil, Star, Trash2 } from 'lucide-react';

export default function ChatActionMenu({
  anchorEl,
  open,
  chat,
  onClose,
  onToggleStar,
  onRename,
  onMove,
  onDelete,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  transformOrigin = { vertical: 'top', horizontal: 'right' },
}) {
  const isStarred = Boolean(chat?.isStarred);
  const itemSx = {
    borderRadius: 1.5,
    px: 2,
    py: 1.25,
    gap: 1,
    fontSize: 14,
    '&:hover': {
      backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
    },
  };

  const handleAction = (action) => {
    if (chat) {
      action(chat.id);
    }
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onClick={(event) => event.stopPropagation()}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        paper: {
          sx: {
            minWidth: 190,
            borderRadius: '12px',
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: 1,
            borderColor: 'divider',
            boxShadow: (theme) => theme.shadows[8],
            p: 0.5,
          },
        },
      }}
    >
      <MenuItem onClick={() => handleAction(onToggleStar)} sx={itemSx}>
        <ListItemIcon sx={{ minWidth: 28 }}>
          <Star size={16} fill={isStarred ? 'currentColor' : 'none'} />
        </ListItemIcon>
        {isStarred ? 'Unstar' : 'Star'}
      </MenuItem>
      <MenuItem onClick={() => handleAction(onRename)} sx={itemSx}>
        <ListItemIcon sx={{ minWidth: 28 }}>
          <Pencil size={16} />
        </ListItemIcon>
        Rename
      </MenuItem>
      <MenuItem onClick={() => handleAction(onMove)} sx={itemSx}>
        <ListItemIcon sx={{ minWidth: 28 }}>
          <FolderPlus size={16} />
        </ListItemIcon>
        Add to project
      </MenuItem>
      <MenuItem
        onClick={() => handleAction(onDelete)}
        sx={{
          borderRadius: 1.5,
          px: 2,
          py: 1.25,
          gap: 1,
          color: '#d93025',
          '& .MuiListItemIcon-root': { color: '#d93025' },
            '&:hover': {
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
            },
        }}
      >
        <ListItemIcon sx={{ minWidth: 28 }}>
          <Trash2 size={16} />
        </ListItemIcon>
        Delete
      </MenuItem>
    </Menu>
  );
}
