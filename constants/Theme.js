import { extendTheme } from 'native-base';

export const wargaTheme = extendTheme({
  colors: {
    primary: {
      50: '#e0f2f3',
      100: '#b3e0e2',
      200: '#80ccd0',
      300: '#4db7bd',
      400: '#26a7af',
      500: '#0a949c',
      600: '#087a82',
      700: '#066168',
      800: '#04474e',
      900: '#022e34',
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
      50: '#e7f3e7',
      100: '#c3e1c2',
      200: '#9bce99',
      300: '#72ba70',
      400: '#54ab52',
      500: '#387d33',
      600: '#2f692b',
      700: '#265523',
      800: '#1c411a',
      900: '#132d12',
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