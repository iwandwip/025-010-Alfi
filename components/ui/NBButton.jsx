import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { lightTheme } from '../../constants/Colors';

const NBButton = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
  size = 'md',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
      paddingHorizontal: size === 'sm' ? 16 : size === 'lg' ? 24 : 20,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: lightTheme.primary,
        };
      case 'secondary':
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: lightTheme.primary,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: lightTheme.primary,
        };
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
      fontWeight: '600',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyle,
          color: lightTheme.white,
        };
      case 'secondary':
      case 'outline':
        return {
          ...baseTextStyle,
          color: lightTheme.primary,
        };
      default:
        return {
          ...baseTextStyle,
          color: lightTheme.white,
        };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[getButtonStyle(), style]}
      accessibilityLabel={accessibilityLabel || title}
      {...props}
    >
      {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
    </TouchableOpacity>
  );
};

export default NBButton;