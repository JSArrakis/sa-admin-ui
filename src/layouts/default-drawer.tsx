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
import { useNavigate } from "react-router-dom";
import { routesConfig } from '../features/page-routing';

interface Item {
    label: string;
    icon: React.FC;
    onClick?: () => void;
    routePath?: string;
}

export const DefaultDrawer = () => {
    const navigate = useNavigate();

    const upperItems: Item[] = [
        {
            label: 'Home',
            icon: Home,
            routePath: routesConfig.HOME.path
        },
        {
            label: 'Movies',
            icon: Theaters,
            routePath: routesConfig.MOVIES.path
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

    const onClick = (item: Item) => {
        item.onClick && item.onClick();
        item.routePath && navigate(item.routePath);
    }

    const renderItem = (item: Item, key: number) => (
        <DrawerItemButton
            key={key}
            iconComponent={item.icon}
            label={item.label}
            onClick={() => onClick(item)}
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
