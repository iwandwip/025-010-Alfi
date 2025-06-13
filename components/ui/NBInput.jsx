import React, { useState } from "react";
import {
  Input as NativeBaseInput,
  FormControl,
  Stack,
  Icon,
  Pressable,
  Text,
  Box,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";

const NBInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  style,
  multiline = false,
  numberOfLines,
  isRequired = false,
  helperText,
  leftElement,
  rightElement,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const passwordToggleElement = secureTextEntry ? (
    <Pressable onPress={togglePasswordVisibility} mr={3}>
      <Icon
        as={MaterialIcons}
        name={isPasswordVisible ? "visibility" : "visibility-off"}
        size="sm"
        color="gray.500"
      />
    </Pressable>
  ) : null;

  return (
    <FormControl
      isInvalid={!!error}
      isRequired={isRequired}
      style={style}
      mb={4}
    >
      <Stack>
        {label && (
          <FormControl.Label
            _text={{
              fontSize: "sm",
              fontWeight: 500,
              color: "gray.700",
            }}
          >
            {label}
          </FormControl.Label>
        )}
        
        <NativeBaseInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          fontSize="md"
          size="lg"
          variant={error ? "outline" : "outline"}
          borderColor={error ? "red.500" : (isFocused ? "primary.500" : "gray.300")}
          bg="white"
          _focus={{
            borderColor: "primary.500",
            bg: "white",
          }}
          InputLeftElement={leftElement}
          InputRightElement={rightElement || passwordToggleElement}
          {...props}
        />
        
        {helperText && !error && (
          <FormControl.HelperText
            _text={{
              fontSize: "xs",
              color: "gray.600",
            }}
          >
            {helperText}
          </FormControl.HelperText>
        )}
        
        {error && (
          <FormControl.ErrorMessage
            _text={{
              fontSize: "xs",
              color: "red.500",
            }}
          >
            {error}
          </FormControl.ErrorMessage>
        )}
      </Stack>
    </FormControl>
  );
};

export default NBInput;