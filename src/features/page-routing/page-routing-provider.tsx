import React from 'react';
import { HashRouter } from 'react-router-dom';

interface Props {
    children?: React.ReactNode;
}

export const PageRoutingProvider = ({ children }: Props) => (
    <HashRouter>
        {children}
    </HashRouter>
);
