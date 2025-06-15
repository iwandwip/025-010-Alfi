import { Platform } from 'react-native';

// Font family constants
export const FONTS = {
  light: Platform.select({
    ios: 'Poppins-Light',
    android: 'Poppins-Light',
    default: 'Poppins-Light',
  }),
  regular: Platform.select({
    ios: 'Poppins-Regular',
    android: 'Poppins-Regular',
    default: 'Poppins-Regular',
  }),
  medium: Platform.select({
    ios: 'Poppins-Medium',
    android: 'Poppins-Medium',
    default: 'Poppins-Medium',
  }),
  semiBold: Platform.select({
    ios: 'Poppins-SemiBold',
    android: 'Poppins-SemiBold',
    default: 'Poppins-SemiBold',
  }),
  bold: Platform.select({
    ios: 'Poppins-Bold',
    android: 'Poppins-Bold',
    default: 'Poppins-Bold',
  }),
};

// Global font styles
export const TEXT_STYLES = {
  light: {
    fontFamily: FONTS.light,
    fontWeight: '300',
  },
  regular: {
    fontFamily: FONTS.regular,
    fontWeight: '400',
  },
  medium: {
    fontFamily: FONTS.medium,
    fontWeight: '500',
  },
  semiBold: {
    fontFamily: FONTS.semiBold,
    fontWeight: '600',
  },
  bold: {
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  // Default for all text
  default: {
    fontFamily: FONTS.regular,
    fontWeight: '400',
  },
};

// Helper function to get font family based on weight
export const getFontFamily = (weight = 400) => {
  switch (weight) {
    case 100:
    case 200:
    case 300:
    case '100':
    case '200':
    case '300':
    case 'light':
      return FONTS.light;
    case 500:
    case '500':
    case 'medium':
      return FONTS.medium;
    case 600:
    case '600':
    case 'semibold':
    case 'semi-bold':
      return FONTS.semiBold;
    case 700:
    case 800:
    case 900:
    case '700':
    case '800':
    case '900':
    case 'bold':
      return FONTS.bold;
    default:
      return FONTS.regular;
  }
};

// Global default style for all Text components
export const defaultTextStyle = {
  fontFamily: FONTS.regular,
  includeFontPadding: false, // Android-specific
  textAlignVertical: 'center', // Android-specific
};