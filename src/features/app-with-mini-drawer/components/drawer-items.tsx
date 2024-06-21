import List from '@mui/material/List';
import React from 'react';

interface Props {
    children?: React.ReactNode;
}

export const DrawerItems = ({ children }: Props) => (
  <List>
    {children}
  </List>
);
