import {
    Route,
    Routes
} from 'react-router-dom';
import { routesConfig } from './routes-config';
import { RouteConfig } from './definitions';

export const PageRouter = () => {
    const renderRoute = (route: RouteConfig, key: number) => (
        <Route
            key={key}
            path={route.path}
            Component={route.component}
        />
    );

    return (
        <Routes>
            {Object.values(routesConfig).map(renderRoute)}
        </Routes>
    );
};
