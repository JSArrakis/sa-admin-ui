import type { Meta, StoryObj } from '@storybook/react';
import { AppWithMiniDrawer } from '../features/app-with-mini-drawer';
import { DefaultDrawer } from './default-drawer';


// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Layouts/Default Drawer',
  component: DefaultDrawer,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
} satisfies Meta<typeof DefaultDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
    render: (args) => (
        <AppWithMiniDrawer
            drawerChildren={(<DefaultDrawer />)}
        >
        </AppWithMiniDrawer>
    )
};

