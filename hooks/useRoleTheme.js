import { useMemo } from 'react';
import { Colors } from '../constants/Colors';
import { Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';

export const useRoleTheme = () => {
  // Simplified approach - always return default colors to prevent initialization issues
  const colors = Colors;

  const theme = {
    colors,
    spacing: Spacing,
    borderRadius: BorderRadius,
    typography: Typography,
    shadows: Shadows,
  };

  return { theme, colors, role: 'user' };
};