export const lightTheme = {
  primary: '#2563EB',
  secondary: '#2563EB',
  background: '#ffffff',
  white: '#ffffff',
  black: '#000000',
  
  gray25: '#fcfcfd',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  success: '#4CAF50',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  danger: '#ef4444',
  
  border: '#e5e7eb',
  
  // Additional colors for compatibility
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  primaryContainer: '#DBEAFE',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#1E3A8A',
  
  // Background colors
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
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  
  // Additional colors
  outline: '#E5E7EB',
  
  // Status colors
  lunas: '#4CAF50',
  belumBayar: '#FF9800',
  terlambat: '#F44336',
  
  // Container colors
  successContainer: '#C8E6C9',
  onSuccessContainer: '#1B5E20',
  warningContainer: '#FFE0B2',
  onWarningContainer: '#E65100',
  errorContainer: '#FFCDD2',
  onErrorContainer: '#B71C1C',
  
  shadow: {
    color: '#000000',
  },
};

export const darkTheme = {
  primary: '#2563EB',
  secondary: '#2563EB',
  background: '#111827',
  white: '#1f2937',
  black: '#ffffff',
  
  gray25: '#1f2937',
  gray50: '#374151',
  gray100: '#4b5563',
  gray200: '#6b7280',
  gray300: '#9ca3af',
  gray400: '#d1d5db',
  gray500: '#e5e7eb',
  gray600: '#f3f4f6',
  gray700: '#f9fafb',
  gray800: '#fcfcfd',
  gray900: '#ffffff',
  
  success: '#4CAF50',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  danger: '#dc2626',
  
  border: '#4b5563',
  
  shadow: {
    color: '#000000',
  },
};

// User theme (Blue)
export const userTheme = {
  primary: '#2563EB',      // Blue
  primaryLight: '#3B82F6', // Lighter Blue
  primaryDark: '#1D4ED8',  // Darker Blue
  secondary: '#2563EB',    // Light Blue
  accent: '#2563EB',       // Very Light Blue
  ...lightTheme,
};

export const getColors = (theme) => {
  if (!theme || typeof theme !== 'string') {
    return lightTheme;
  }
  return theme === 'dark' ? darkTheme : lightTheme;
};

// Function to get theme based on user role
export const getThemeByRole = (isAdmin, isDark = false) => {
  if (isDark) {
    return darkTheme;
  }
  return userTheme;
};

export const Colors = lightTheme;