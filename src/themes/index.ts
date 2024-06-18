import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const darkTheme = createTheme({
    palette:{ mode: 'dark' }
});

export const lightTheme = createTheme({
    palette:{ mode: 'light' }
});