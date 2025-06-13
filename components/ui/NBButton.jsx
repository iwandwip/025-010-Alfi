import React from "react";
import { Button as NativeBaseButton } from "native-base";

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
          variant: "solid",
          colorScheme: "primary",
          _text: { ...textStyle },
        };
      case "secondary":
        return {
          variant: "outline",
          colorScheme: "primary",
          _text: { ...textStyle },
        };
      case "outline":
        return {
          variant: "outline",
          colorScheme: "primary",
          _text: { ...textStyle },
        };
      default:
        return {
          variant: "solid",
          colorScheme: "primary",
          _text: { ...textStyle },
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
      rounded="lg"
      accessibilityLabel={accessibilityLabel || title}
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