import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Colors, Typography, BorderRadius, Shadows } from '../../constants/theme';

const NativeButton = ({
  title,
  onPress,
  variant = 'contained',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    if (variant === 'contained') {
      baseStyle.push(styles.contained);
    } else if (variant === 'outlined') {
      baseStyle.push(styles.outlined);
    } else if (variant === 'text') {
      baseStyle.push(styles.text);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];
    
    if (variant === 'contained') {
      baseStyle.push(styles.containedText);
    } else if (variant === 'outlined') {
      baseStyle.push(styles.outlinedText);
    } else if (variant === 'text') {
      baseStyle.push(styles.textButtonText);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledText);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator 
            size="small" 
            color={variant === 'contained' ? Colors.textInverse : Colors.primary} 
            style={styles.loader}
          />
        )}
        {icon && !loading && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        <Text style={[...getTextStyle(), textStyle]}>
          {loading ? 'Loading...' : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  contained: {
    backgroundColor: Colors.primary,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  text: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  disabled: {
    backgroundColor: Colors.surfaceVariant,
    borderColor: Colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...Typography.button,
    textAlign: 'center',
  },
  containedText: {
    color: Colors.textInverse,
  },
  outlinedText: {
    color: Colors.primary,
  },
  textButtonText: {
    color: Colors.primary,
  },
  disabledText: {
    color: Colors.textDisabled,
  },
  loader: {
    marginRight: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default NativeButton;