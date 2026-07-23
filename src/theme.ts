import { createTheme } from '@mui/material';

export const theme = createTheme({
  typography: {
    fontFamily: '"Montserrat", Arial, sans-serif',
    fontWeightBold: 700,
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#14325C',
      light: '#3F5D92',
      dark: '#0D2144',
      contrastText: '#fff',
    },
    secondary: {
      main: '#4C7FEA',
      contrastText: '#fff',
    },
    background: {
      default: '#F4F6FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#152D4A',
      secondary: '#5D6E89',
    },
    divider: '#DCE3EE',
  },
  shape: { borderRadius: 14 },
});