import type { Meta, StoryObj } from '@storybook/react';
import { AppWithMiniDrawer } from './app-with-mini-drawer';
import { DrawerItems } from './drawer-items';
import { DrawerItemButton } from './drawer-item-button';

import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Features/App With Mini Drawer',
  component: AppWithMiniDrawer,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs']
} satisfies Meta<typeof AppWithMiniDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
    render: (args) => (
        <AppWithMiniDrawer
            appBarChildren={(
                <>
                <Typography variant="h6" noWrap component="div">
                    Mini variant drawer
                </Typography>
                </>
            )}
            drawerChildren={(
                <>
                    <DrawerItems>
                        <DrawerItemButton iconComponent={InboxIcon} label='Inbox' />
                        <DrawerItemButton iconComponent={MailIcon} label='Sent' />
                        <DrawerItemButton iconComponent={MailIcon} label='Trash' />
                    </DrawerItems>
                    <Divider />
                    <DrawerItems>
                        <DrawerItemButton iconComponent={InboxIcon} label='Inbox' />
                        <DrawerItemButton iconComponent={MailIcon} label='Sent' />
                        <DrawerItemButton iconComponent={MailIcon} label='Trash' />
                    </DrawerItems>
                </>
            )}
        >
            <Typography paragraph>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non
                enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus
                imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus.
                Convallis convallis tellus id interdum velit laoreet id donec ultrices.
                Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit
                adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra
                nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum
                leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis
                feugiat vivamus at augue. At augue eget arcu dictum varius duis at
                consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa
                sapien faucibus et molestie ac.
            </Typography>
            <Typography paragraph>
                Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper
                eget nulla facilisi etiam dignissim diam. Pulvinar elementum integer enim
                neque volutpat ac tincidunt. Ornare suspendisse sed nisi lacus sed viverra
                tellus. Purus sit amet volutpat consequat mauris. Elementum eu facilisis
                sed odio morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi
                tincidunt ornare massa eget egestas purus viverra accumsan in. In hendrerit
                gravida rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam sem
                et tortor. Habitant morbi tristique senectus et. Adipiscing elit duis
                tristique sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis
                eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla
                posuere sollicitudin aliquam ultrices sagittis orci a.
            </Typography>
        </AppWithMiniDrawer>
    )
};

