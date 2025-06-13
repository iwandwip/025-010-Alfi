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
import { Colors } from "../../constants/Colors";

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
        size={5}
        color={Colors.gray500}
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
              fontSize: 14,
              fontWeight: "500",
              color: Colors.gray700,
            }}
          >
            {label}
          </FormControl.Label>
        )}
        
        <NativeBaseInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray400}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          fontSize={16}
          color={Colors.gray900}
          borderRadius={8}
          borderWidth={1}
          borderColor={error ? Colors.error : (isFocused ? Colors.primary : Colors.gray300)}
          backgroundColor={Colors.white}
          px={4}
          py={3}
          minHeight={multiline ? 20 : 12}
          _focus={{
            borderColor: Colors.primary,
            backgroundColor: Colors.white,
          }}
          _hover={{
            borderColor: Colors.primary,
          }}
          _disabled={{
            backgroundColor: Colors.gray100,
            borderColor: Colors.gray300,
            opacity: 0.6,
          }}
          InputLeftElement={leftElement}
          InputRightElement={rightElement || passwordToggleElement}
          {...props}
        />
        
        {helperText && !error && (
          <FormControl.HelperText
            _text={{
              fontSize: 12,
              color: Colors.gray600,
            }}
          >
            {helperText}
          </FormControl.HelperText>
        )}
        
        {error && (
          <FormControl.ErrorMessage
            _text={{
              fontSize: 12,
              color: Colors.error,
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