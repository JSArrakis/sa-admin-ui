import { createContextForController } from 'react-controller-context';
import { useDrawerController } from '../hooks';

export const drawerContext = createContextForController(useDrawerController);
