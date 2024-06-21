import { AppWithMiniDrawer } from '../features/app-with-mini-drawer';
import { DefaultDrawer } from '../layouts/default-drawer';
import Typography from '@mui/material/Typography';
import { PageRouter, PageRoutingProvider } from '../features/page-routing';

export const Main = () => {
    return (
        <PageRoutingProvider>
            <AppWithMiniDrawer
                drawerChildren={(<DefaultDrawer />)}
                appBarChildren={(
                    <Typography variant="h6" noWrap component="div">
                        Stream Assistant Admin
                    </Typography>
                )}
            >
                <PageRouter />
            </AppWithMiniDrawer>
        </PageRoutingProvider>
    );
};
