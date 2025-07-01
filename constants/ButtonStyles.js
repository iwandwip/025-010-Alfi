import { StyleSheet } from 'react-native';
import { lightTheme as Colors } from './Colors';
import { Spacing, BorderRadius, Typography } from './theme';

export const ButtonStyles = StyleSheet.create({
  // Base button container
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    minHeight: 48,
  },
  
  // Primary button
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  
  primaryButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
  
  // Secondary button
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  
  secondaryButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
  
  // Outlined button
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  
  outlinedButtonText: {
    ...Typography.button,
    color: Colors.primary,
  },
  
  // Text button
  textButton: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  
  textButtonText: {
    ...Typography.button,
    color: Colors.primary,
    textTransform: 'none',
  },
  
  // Contained tonal button
  tonalButton: {
    backgroundColor: Colors.primaryContainer,
  },
  
  tonalButtonText: {
    ...Typography.button,
    color: Colors.onPrimaryContainer,
  },
  
  // Large button
  largeButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    minHeight: 56,
  },
  
  largeButtonText: {
    ...Typography.buttonLarge,
  },
  
  // Small button
  smallButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    minHeight: 36,
  },
  
  smallButtonText: {
    ...Typography.button,
    fontSize: 12,
  },
  
  // Full width button
  fullWidthButton: {
    width: '100%',
  },
  
  // Disabled state
  disabledButton: {
    backgroundColor: Colors.surfaceVariant,
  },
  
  disabledButtonText: {
    color: Colors.textDisabled,
  },
  
  // Icon in button
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  
  buttonIconOnly: {
    marginRight: 0,
  },
  
  // FAB styles
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  
  fabExtended: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    height: 56,
    minWidth: 56,
  },
  
  // Icon button
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  iconButtonSmall: {
    width: 36,
    height: 36,
  },
  
  iconButtonLarge: {
    width: 56,
    height: 56,
  },
});