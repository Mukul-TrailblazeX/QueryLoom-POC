import * as React from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export default function FileUploadButton({
  accept,
  icon,
  label,
  multiple = true,
  onFilesSelected,
  size = 'medium',
  variant = 'text',
}) {
  const inputRef = React.useRef(null);

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  const handleChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length > 0) {
      onFilesSelected(files);
    }

    event.target.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
      />
      {variant === 'icon' ? (
        <Tooltip title={label}>
          <IconButton
            size={size}
            onClick={handleOpenPicker}
            aria-label={label}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '14px',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#2d6a4f',
                borderColor: 'rgba(45, 106, 79, 0.28)',
                backgroundColor: 'rgba(45, 106, 79, 0.05)',
              },
            }}
          >
            {icon}
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          variant={variant}
          startIcon={icon}
          onClick={handleOpenPicker}
          size="small"
          sx={{
            borderRadius: 999,
            transition: 'all 0.2s ease',
            ...(variant === 'outlined' && {
              borderColor: 'rgba(45, 106, 79, 0.25)',
              color: '#2d6a4f',
              '&:hover': {
                borderColor: '#2d6a4f',
                backgroundColor: 'rgba(45, 106, 79, 0.05)',
              },
            }),
          }}
        >
          {label}
        </Button>
      )}
    </>
  );
}
