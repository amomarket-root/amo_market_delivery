import React from 'react';
import { MenuItem, IconButton, Typography } from '@mui/material';

const MenuItemWithIcon = ({ icon, text, color, onClick }) => {
  return (
    <MenuItem onClick={onClick}>
      <IconButton>
        {React.cloneElement(icon, { sx: { color } })}
      </IconButton>
      <Typography variant="body1">{text}</Typography>
    </MenuItem>
  );
};

export default MenuItemWithIcon;
