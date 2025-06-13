import React from "react";
import { Button as NativeBaseButton } from "native-base";
import { Colors } from "../../constants/Colors";

const NBButton = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
  size = "md",
  leftIcon,
  rightIcon,
  ...props
}) => {
  // Map custom variants to NativeBase variants
  const getVariantProps = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: Colors.primary,
          _text: { color: Colors.white, ...textStyle },
          _pressed: { backgroundColor: `${Colors.primary}CC` },
          _disabled: {
            backgroundColor: Colors.gray300,
            _text: { color: Colors.gray500 },
          },
        };
      case "secondary":
        return {
          backgroundColor: Colors.secondary,
          borderWidth: 1,
          borderColor: Colors.primary,
          _text: { color: Colors.primary, ...textStyle },
          _pressed: { backgroundColor: `${Colors.secondary}CC` },
          _disabled: {
            backgroundColor: Colors.gray300,
            _text: { color: Colors.gray500 },
          },
        };
      case "outline":
        return {
          variant: "outline",
          borderColor: Colors.primary,
          _text: { color: Colors.primary, ...textStyle },
          _pressed: { backgroundColor: `${Colors.primary}1A` },
          _disabled: {
            borderColor: Colors.gray300,
            _text: { color: Colors.gray500 },
          },
        };
      default:
        return {
          backgroundColor: Colors.primary,
          _text: { color: Colors.white, ...textStyle },
        };
    }
  };

  const variantProps = getVariantProps();

  // Map size to NativeBase sizes
  const getSize = () => {
    switch (size) {
      case "xs":
        return "xs";
      case "sm":
        return "sm";
      case "lg":
        return "lg";
      case "md":
      default:
        return "md";
    }
  };

  return (
    <NativeBaseButton
      onPress={onPress}
      isDisabled={disabled}
      size={getSize()}
      borderRadius={8}
      minHeight={12}
      px={6}
      py={3}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      {...variantProps}
      {...props}
      style={style}
    >
      {title}
    </NativeBaseButton>
  );
};

export default NBButton;