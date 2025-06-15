import { extendTheme } from 'native-base';

export const wargaTheme = extendTheme({
  colors: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    secondary: {
      50: '#f0f0f0',
      100: '#d9d9d9',
      200: '#bfbfbf',
      300: '#a6a6a6',
      400: '#8c8c8c',
      500: '#737373',
      600: '#595959',
      700: '#404040',
      800: '#262626',
      900: '#0d0d0d',
    },
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'lg',
        _text: {
          fontWeight: 'semibold',
        },
      },
      defaultProps: {
        size: 'lg',
        colorScheme: 'primary',
      },
    },
    Input: {
      baseStyle: {
        borderRadius: 'lg',
        fontSize: 'md',
        _focus: {
          borderColor: 'primary.500',
          bg: 'coolGray.50',
        },
      },
      defaultProps: {
        size: 'lg',
      },
    },
    Box: {
      baseStyle: {
        rounded: 'lg',
      },
    },
    Card: {
      baseStyle: {
        rounded: 'lg',
        shadow: 2,
        bg: 'white',
        p: 4,
      },
    },
  },
  config: {
    initialColorMode: 'light',
  },
});

export const bendaharaTheme = extendTheme({
  colors: {
    primary: {
      50: '#e8eaf6',
      100: '#c5cae9',
      200: '#9fa8da',
      300: '#7986cb',
      400: '#5c6bc0',
      500: '#3f51b5',
      600: '#3949ab',
      700: '#303f9f',
      800: '#283593',
      900: '#1a237e',
    },
    secondary: {
      50: '#f0f0f0',
      100: '#d9d9d9',
      200: '#bfbfbf',
      300: '#a6a6a6',
      400: '#8c8c8c',
      500: '#737373',
      600: '#595959',
      700: '#404040',
      800: '#262626',
      900: '#0d0d0d',
    },
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'lg',
        _text: {
          fontWeight: 'semibold',
        },
      },
      defaultProps: {
        size: 'lg',
        colorScheme: 'primary',
      },
    },
    Input: {
      baseStyle: {
        borderRadius: 'lg',
        fontSize: 'md',
        _focus: {
          borderColor: 'primary.500',
          bg: 'coolGray.50',
        },
      },
      defaultProps: {
        size: 'lg',
      },
    },
    Box: {
      baseStyle: {
        rounded: 'lg',
      },
    },
    Card: {
      baseStyle: {
        rounded: 'lg',
        shadow: 2,
        bg: 'white',
        p: 4,
      },
    },
  },
  config: {
    initialColorMode: 'light',
  },
});