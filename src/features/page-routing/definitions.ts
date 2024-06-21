export interface RouteConfig {
    path: string;
    component: React.FC;
}

export interface RoutesConfig {
    [key: string]: RouteConfig;
}