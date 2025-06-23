import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/theme';

const NativeCard = ({ children, style, mode = 'elevated', ...props }) => {
  const getCardStyle = () => {
    const baseStyle = [styles.card];
    
    if (mode === 'elevated') {
      baseStyle.push(styles.elevated);
    } else if (mode === 'outlined') {
      baseStyle.push(styles.outlined);
    }
    
    return baseStyle;
  };

  return (
    <View style={[...getCardStyle(), style]} {...props}>
      {children}
    </View>
  );
};

const CardContent = ({ children, style, ...props }) => {
  return (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  elevated: {
    ...Shadows.sm,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.none,
  },
  content: {
    padding: Spacing.md,
  },
});

NativeCard.Content = CardContent;

export default NativeCard;