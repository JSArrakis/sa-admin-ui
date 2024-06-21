import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { drawerContext } from '../contexts';
import React from 'react';
import Tooltip from '@mui/material/Tooltip';

interface Props {
    iconComponent?: React.FC;
    label?: string;
    toolTip?: string;
    onClick?: () => void;
}

export const DrawerItemButton = ({
    iconComponent: IconComponent,
    label,
    toolTip,
    onClick = () => {}
}: Props) => {
    const drawerController = drawerContext.useController();
    return (
        <Tooltip
            title={!drawerController.isOpen ? toolTip || label : toolTip}
            arrow
            enterDelay={500}
            enterNextDelay={500}
            placement='right'
        >
            <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: drawerController.isOpen ? 'initial' : 'center',
                        px: 2.5,
                    }}
                    onClick={onClick}
                >
                    { IconComponent && 
                        <ListItemIcon
                            sx={{
                            minWidth: 0,
                            mr: drawerController.isOpen ? 3 : 'auto',
                            justifyContent: 'center',
                            }}
                        >
                            <IconComponent />
                        </ListItemIcon>
                    }
                    <ListItemText primary={label} sx={{ opacity: drawerController.isOpen ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
        </Tooltip>
    );
};
