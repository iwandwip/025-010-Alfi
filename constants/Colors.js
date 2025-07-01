// Base theme colors - Alfi Blue Theme
export const lightTheme = {
  primary: '#113b62',
  primaryLight: '#1e4a73',
  primaryDark: '#0d2a47',
  secondary: '#2563eb',
  accent: '#dbeafe',
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
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#113b62',
  
  border: '#e5e7eb',
  
  shadow: {
    color: '#000000',
  },
};

// Admin theme (Blue)
export const adminTheme = {
  primary: '#113b62',
  primaryLight: '#1e4a73',
  primaryDark: '#0d2a47',
  secondary: '#2563eb',
  accent: '#dbeafe',
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
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#113b62',
  
  border: '#e5e7eb',
  
  shadow: {
    color: '#000000',
  },
};

// Warga theme (Blue)
export const wargaTheme = {
  primary: '#113b62',
  primaryLight: '#1e4a73',
  primaryDark: '#0d2a47',
  secondary: '#2563eb',
  accent: '#dbeafe',
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
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#113b62',
  
  border: '#e5e7eb',
  
  shadow: {
    color: '#000000',
  },
};

export const darkTheme = {
  primary: '#113b62',
  primaryLight: '#1e4a73',
  primaryDark: '#0d2a47',
  secondary: '#2563eb',
  accent: '#dbeafe',
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
  
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#113b62',
  
  border: '#4b5563',
  
  shadow: {
    color: '#000000',
  },
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
  if (isAdmin) {
    return adminTheme;
  }
  return wargaTheme;
};

export const Colors = lightTheme;