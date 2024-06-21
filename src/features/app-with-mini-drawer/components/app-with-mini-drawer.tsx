import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { drawerContext } from '../contexts';
import { AppBar } from './app-bar';
import { Drawer } from './drawer';
import React from 'react';

interface Props {
    children?: React.ReactNode;
    drawerChildren?: React.ReactNode;
    appBarChildren?: React.ReactNode;
}

export const AppWithMiniDrawer = ({
    children,
    drawerChildren,
    appBarChildren
}: Props) => {
  return (
    <drawerContext.Provider>
        <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar>
            {appBarChildren}
        </AppBar>
        <Drawer>
            {drawerChildren}
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, paddingTop: 10 }}>
            {children}
        </Box>
        </Box>
    </drawerContext.Provider>
  );
};