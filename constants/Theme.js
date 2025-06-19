import { Platform } from 'react-native';

export const Colors = {
  primary: '#F50057',
  primaryDark: '#C51162',
  primaryLight: '#FF5983',
  primaryContainer: '#FFCDD2',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#8E24AA',
  
  secondary: '#2196F3',
  secondaryDark: '#1976D2', 
  secondaryLight: '#64B5F6',
  
  tertiary: '#9C27B0',
  tertiaryContainer: '#E1BEE7',
  onTertiaryContainer: '#6A1B9A',
  
  success: '#4CAF50',
  successContainer: '#C8E6C9',
  onSuccessContainer: '#1B5E20',
  
  warning: '#FF9800',
  warningContainer: '#FFE0B2',
  onWarningContainer: '#E65100',
  
  error: '#F44336',
  errorContainer: '#FFCDD2',
  onErrorContainer: '#B71C1C',
  
  info: '#2196F3',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#FAFAFA',
  
  // Surface colors
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',
  onSurface: '#212121',
  
  // View colors
  onView: '#212121',
  onViewVariant: '#757575',
  
  // Text colors
  text: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  
  // Status colors
  lunas: '#4CAF50',
  belumBayar: '#FF9800',
  terlambat: '#F44336',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 50,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: Colors.text,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    color: Colors.text,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: Colors.text,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: Colors.text,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: Colors.text,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: Colors.text,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textInverse,
  },
};

export const Shadows = {
  sm: Platform.OS === 'ios' ? {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 1.5,
  } : {
    elevation: 2,
  },
  md: Platform.OS === 'ios' ? {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.16,
    shadowRadius: 3.5,
  } : {
    elevation: 4,
  },
  lg: Platform.OS === 'ios' ? {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.20,
    shadowRadius: 6.0,
  } : {
    elevation: 8,
  },
};

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
  shadows: Shadows,
};