import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getColorsForRole, BaseColors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';

export const useRoleTheme = () => {
  let authData = { userProfile: null, isAdmin: false };
  
  try {
    authData = useAuth();
  } catch (error) {
    console.warn('useAuth not ready, using default theme');
  }
  
  const { userProfile, isAdmin } = authData;
  
  const colors = useMemo(() => {
    // Determine role based on profile or admin status
    let role = 'user';
    if (isAdmin || userProfile?.role === 'bendahara' || userProfile?.role === 'admin') {
      role = 'bendahara';
    } else if (userProfile?.role) {
      role = userProfile.role;
    }
    
    const roleColors = getColorsForRole(role);
    
    return {
      ...BaseColors,
      ...roleColors,
    };
  }, [userProfile?.role, isAdmin]);

  const theme = useMemo(() => ({
    colors,
    spacing: Spacing,
    borderRadius: BorderRadius,
    typography: Typography,
    shadows: Shadows,
  }), [colors]);

  const currentRole = isAdmin || userProfile?.role === 'bendahara' || userProfile?.role === 'admin' ? 'bendahara' : (userProfile?.role || 'user');
  
  return { theme, colors, role: currentRole };
};