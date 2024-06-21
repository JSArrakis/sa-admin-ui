import React from 'react';
import { RoutesConfig } from './definitions';
import { Home } from '../../pages/home';
import { Movies } from '../../pages/movies';

export const routesConfig: RoutesConfig = {
    HOME: {
        path: '/',
        component: Home
    },
    MOVIES: {
        path: '/movies',
        component: Movies
    }
};
