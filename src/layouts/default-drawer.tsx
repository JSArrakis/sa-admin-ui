import {
    DrawerItems,
    DrawerItemButton
} from '../features/app-with-mini-drawer';
import Divider from '@mui/material/Divider';
import {
    Home,
    Tv,
    Theaters,
    Shop,
    AvTimer,
    MusicVideo,
    Settings,
    TheaterComedy
} from '@mui/icons-material';
import React from 'react';

interface Item {
    label: string;
    icon: React.FC;
    onClick?: () => void;
}

export const DefaultDrawer = () => {

    const upperItems: Item[] = [
        {
            label: 'Home',
            icon: Home
        },
        {
            label: 'Movies',
            icon: Theaters
        },
        {
            label: 'Shows',
            icon: Tv
        },
        {
            label: 'Shorts',
            icon: AvTimer
        },
        {
            label: 'Music',
            icon: MusicVideo
        },
        {
            label: 'Commercials',
            icon: Shop
        },
        {
            label: 'Promos',
            icon: TheaterComedy
        },
    ]

    const lowerItems: Item[] = [
        {
            label: 'Settings',
            icon: Settings
        }
    ]


    const renderItem = (item: Item, key: number) => (
        <DrawerItemButton
            key={key}
            iconComponent={item.icon}
            label={item.label}
            onClick={item.onClick}
        />
    );

    return (
        <>
            <DrawerItems>
                {upperItems.map(renderItem)}
            </DrawerItems>
            <Divider />
            <DrawerItems>
                {lowerItems.map(renderItem)}
            </DrawerItems>
        </>
    );
};
