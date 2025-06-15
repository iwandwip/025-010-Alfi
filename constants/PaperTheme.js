import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { Platform } from 'react-native';

// Custom color palette
const colors = {
  primary: '#1E88E5',
  secondary: '#00ACC1',
  tertiary: '#7B1FA2',
  success: '#43A047',
  warning: '#FB8C00',
  error: '#E53935',
  info: '#039BE5',
  
  // Additional custom colors
  primaryLight: '#64B5F6',
  primaryDark: '#1565C0',
  secondaryLight: '#4DD0E1',
  secondaryDark: '#00838F',
  
  // Grays
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
};

// Custom font configuration
const fontConfig = {
  displayLarge: {
    fontFamily: Platform.select({
      ios: 'Poppins-Light',
      android: 'Poppins-Light',
      default: 'Poppins-Light',
    }),
    fontSize: 57,
    fontWeight: '300',
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins-Regular',
      default: 'Poppins-Regular',
    }),
    fontSize: 45,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins-Regular',
      default: 'Poppins-Regular',
    }),
    fontSize: 36,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins-Regular',
      default: 'Poppins-Regular',
    }),
    fontSize: 32,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins-Regular',
      default: 'Poppins-Regular',
    }),
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins-Medium',
      default: 'Poppins-Medium',
    }),
    fontSize: 24,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins-Medium',
      default: 'Poppins-Medium',
    }),
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins-Medium',
      default: 'Poppins-Medium',
    }),
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins-Medium',
      default: 'Poppins-Medium',
    }),
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins-Medium',
      default: 'Poppins-Medium',
    }),
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins-Medium',
      default: 'Poppins-Medium',
    }),
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins-Medium',
      default: 'Poppins-Medium',
    }),
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins-Regular',
      default: 'Poppins-Regular',
    }),
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins-Regular',
      default: 'Poppins-Regular',
    }),
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins-Regular',
      default: 'Poppins-Regular',
    }),
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  default: {
    fontFamily: Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins-Regular',
      default: 'Poppins-Regular',
    }),
    fontWeight: '400',
    letterSpacing: 0,
  },
};

export const lightTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    primaryContainer: colors.primaryLight,
    secondaryContainer: colors.secondaryLight,
    error: colors.error,
    errorContainer: '#FFCDD2',
    
    // Custom colors
    success: colors.success,
    successContainer: '#C8E6C9',
    warning: colors.warning,
    warningContainer: '#FFE0B2',
    info: colors.info,
    infoContainer: '#B3E5FC',
    
    // Surface colors
    surface: '#FFFFFF',
    surfaceVariant: colors.gray100,
    surfaceDisabled: colors.gray200,
    
    // Text colors
    onSurface: colors.gray900,
    onSurfaceVariant: colors.gray700,
    onSurfaceDisabled: colors.gray500,
    
    // Background
    background: colors.gray50,
    onBackground: colors.gray900,
    
    // Outline
    outline: colors.gray400,
    outlineVariant: colors.gray300,
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    secondary: colors.secondaryLight,
    tertiary: '#CE93D8',
    primaryContainer: colors.primaryDark,
    secondaryContainer: colors.secondaryDark,
    error: '#EF5350',
    errorContainer: '#D32F2F',
    
    // Custom colors
    success: '#66BB6A',
    successContainer: '#388E3C',
    warning: '#FFA726',
    warningContainer: '#F57C00',
    info: '#29B6F6',
    infoContainer: '#0277BD',
    
    // Surface colors
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    surfaceDisabled: '#3A3A3A',
    
    // Text colors
    onSurface: '#FFFFFF',
    onSurfaceVariant: colors.gray300,
    onSurfaceDisabled: colors.gray600,
    
    // Background
    background: '#121212',
    onBackground: '#FFFFFF',
    
    // Outline
    outline: colors.gray600,
    outlineVariant: colors.gray700,
  },
  roundness: 12,
};

export default { lightTheme, darkTheme, colors };