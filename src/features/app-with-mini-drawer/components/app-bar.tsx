import { styled } from '@mui/material/styles';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { drawerContext } from '../contexts';
import { drawerWidth } from '../constants';
import React from 'react';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

interface Props {
  children?: React.ReactNode;
}

export const AppBar = ({
  children
}: Props) => {
    const drawerController = drawerContext.useController();
    return (
        <StyledAppBar position="fixed" open={drawerController.isOpen}>
            <Toolbar>
            <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => drawerController.setOpen(true)}
                edge="start"
                sx={{
                marginRight: 5,
                ...(drawerController.isOpen && { display: 'none' }),
                }}
            >
                <MenuIcon />
            </IconButton>
            {children}
            </Toolbar>
        </StyledAppBar>
    );
};
