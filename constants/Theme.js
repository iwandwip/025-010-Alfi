import { Platform } from 'react-native';
import { Colors } from './Colors';

// Role-based color schemes
export const RoleColors = {
  // Bendahara (Admin) - Red Theme
  bendahara: {
    primary: '#DC2626',
    primaryDark: '#B91C1C',
    primaryLight: '#EF4444',
    primaryContainer: '#FEE2E2',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#7F1D1D',
  },
  
  // Admin - Red Theme (same as bendahara)
  admin: {
    primary: '#DC2626',
    primaryDark: '#B91C1C',
    primaryLight: '#EF4444',
    primaryContainer: '#FEE2E2',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#7F1D1D',
  },
  
  // Warga (User) - Blue Theme
  user: {
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryLight: '#3B82F6',
    primaryContainer: '#DBEAFE',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#1E3A8A',
  },
  
  // Default fallback - Blue Theme
  default: {
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryLight: '#3B82F6',
    primaryContainer: '#DBEAFE',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#1E3A8A',
  },
};

// Function to get colors based on role
export const getColorsForRole = (role) => {
  return RoleColors[role] || RoleColors.default;
};

// Base Colors (role-independent)
export const BaseColors = {
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
  surfaceVariant: '#F7F8FA',
  onSurface: '#1A1A1A',
  onSurfaceVariant: '#6B7280',
  
  // View colors
  onView: '#1A1A1A',
  onViewVariant: '#6B7280',
  
  // Text colors
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textDisabled: '#D1D5DB',
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  
  // Additional colors
  outline: '#E5E7EB',
  
  // Status colors
  lunas: '#4CAF50',
  belumBayar: '#FF9800',
  terlambat: '#F44336',
};

// Default Colors (backward compatibility) - will be overridden by theme context
export const Colors = {
  primary: '#F50057',
  primaryDark: '#C51162',
  primaryLight: '#FF5983',
  primaryContainer: '#FFCDD2',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#8E24AA',
  ...BaseColors,
  
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
  surfaceVariant: '#F7F8FA',
  onSurface: '#1A1A1A',
  onSurfaceVariant: '#6B7280',
  
  // View colors
  onView: '#1A1A1A',
  onViewVariant: '#6B7280',
  
  // Text colors
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textDisabled: '#D1D5DB',
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  
  // Additional colors
  outline: '#E5E7EB',
  
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
    letterSpacing: -0.5,
    color: Colors.text,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    letterSpacing: -0.3,
    color: Colors.text,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: -0.2,
    color: Colors.text,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.1,
    color: Colors.text,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    color: Colors.text,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: Colors.text,
  },
  subtitle1: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.1,
    color: Colors.text,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.1,
    color: Colors.text,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.15,
    color: Colors.text,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.15,
    color: Colors.text,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
    color: Colors.textSecondary,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
  },
  button: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.75,
    textTransform: 'uppercase',
    color: Colors.textInverse,
  },
  buttonLarge: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: Colors.textInverse,
  },
};

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: Platform.OS === 'ios' ? {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1.0,
  } : {
    elevation: 1,
  },
  sm: Platform.OS === 'ios' ? {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.0,
  } : {
    elevation: 2,
  },
  md: Platform.OS === 'ios' ? {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.10,
    shadowRadius: 3.0,
  } : {
    elevation: 3,
  },
  lg: Platform.OS === 'ios' ? {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4.0,
  } : {
    elevation: 4,
  },
  xl: Platform.OS === 'ios' ? {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.0,
  } : {
    elevation: 6,
  },
};

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
  shadows: Shadows,
};