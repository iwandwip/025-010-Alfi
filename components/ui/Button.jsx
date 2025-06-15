import React from "react";
import { Button as PaperButton } from "react-native-paper";

/**
 * Wrapper component for React Native Paper Button
 * Maintains compatibility with existing Button usage
 * while providing Material Design styling
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
  // Map custom variants to Paper Button modes
  const getMode = () => {
    switch (variant) {
      case "primary":
        return "contained";
      case "secondary":
        return "contained-tonal";
      case "outline":
        return "outlined";
      default:
        return "contained";
    }
  };

  return (
    <PaperButton
      mode={getMode()}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      icon={icon}
      style={[
        {
          borderRadius: 8,
          minHeight: 48,
        },
        style,
      ]}
      contentStyle={{
        paddingVertical: 6,
        paddingHorizontal: 16,
        minHeight: 48,
      }}
      labelStyle={[
        {
          fontSize: 16,
          fontWeight: '600',
        },
        textStyle,
      ]}
      accessibilityLabel={accessibilityLabel || title || children}
      {...props}
    >
      {children || title}
    </PaperButton>
  );
};

export default Button;