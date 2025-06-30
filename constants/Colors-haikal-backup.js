// Base theme colors
export const lightTheme = {
  primary: '#F50057',
  secondary: '#00f59e',
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
  
  border: '#e5e7eb',
  
  shadow: {
    color: '#000000',
  },
};

// Admin theme (Blue)
export const adminTheme = {
  primary: '#2563eb',      // Blue 600
  primaryLight: '#3b82f6', // Blue 500
  primaryDark: '#1d4ed8',  // Blue 700
  secondary: '#60a5fa',    // Blue 400
  accent: '#dbeafe',       // Blue 100
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
  
  border: '#e5e7eb',
  
  shadow: {
    color: '#000000',
  },
};

// Wali theme (Green)
export const waliTheme = {
  primary: '#059669',      // Green 600
  primaryLight: '#10b981', // Green 500
  primaryDark: '#047857',  // Green 700
  secondary: '#34d399',    // Green 400
  accent: '#d1fae5',       // Green 100
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
  
  border: '#e5e7eb',
  
  shadow: {
    color: '#000000',
  },
};

export const darkTheme = {
  primary: '#F50057',
  secondary: '#00f59e',
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
  return waliTheme;
};

export const Colors = lightTheme;