import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { lightTheme } from "../../constants/Colors";

const Button = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
  textStyle,
}) => {
  const theme = lightTheme;
  
  const getButtonStyle = () => {
    const baseStyle = {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
    };

    if (disabled) {
      return {
        ...baseStyle,
        backgroundColor: theme.gray300,
      };
    }

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: theme.primary,
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: theme.secondary,
          borderWidth: 1,
          borderColor: theme.primary,
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.primary,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.primary,
        };
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontSize: 16,
      fontWeight: "600",
    };

    if (disabled) {
      return {
        ...baseStyle,
        color: theme.gray500,
      };
    }

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          color: theme.white,
        };
      case "secondary":
      case "outline":
        return {
          ...baseStyle,
          color: theme.primary,
        };
      default:
        return {
          ...baseStyle,
          color: theme.white,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[getTextStyle(), textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};


export default Button;
