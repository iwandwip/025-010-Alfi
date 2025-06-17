import React from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";

/**
 * Custom Button component with Material Design styling
 * Maintains compatibility with existing Button usage
 */
const Button = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
  loading = false,
  icon,
  children,
  ...props
}) => {
  // Get button styles based on variant
  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 8,
      minHeight: 48,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: disabled ? '#ccc' : '#F50057',
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: disabled ? '#f0f0f0' : '#f5f5f5',
          borderWidth: 1,
          borderColor: disabled ? '#ccc' : '#F50057',
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? '#ccc' : '#F50057',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: disabled ? '#ccc' : '#F50057',
        };
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontSize: 16,
      fontWeight: '600',
    };

    switch (variant) {
      case "primary":
        return {
          ...baseTextStyle,
          color: disabled ? '#999' : '#FFFFFF',
        };
      case "secondary":
      case "outline":
        return {
          ...baseTextStyle,
          color: disabled ? '#999' : '#F50057',
        };
      default:
        return {
          ...baseTextStyle,
          color: disabled ? '#999' : '#FFFFFF',
        };
    }
  };

  return (
    <TouchableOpacity
      onPress={disabled || loading ? undefined : onPress}
      style={[getButtonStyle(), style]}
      accessibilityLabel={accessibilityLabel || title || children}
      activeOpacity={0.8}
      {...props}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#FFFFFF' : '#F50057'} 
          style={{ marginRight: 8 }}
        />
      )}
      {icon && (
        <View style={{ marginRight: 8 }}>
          {icon}
        </View>
      )}
      <Text style={[getTextStyle(), textStyle]}>
        {children || title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;