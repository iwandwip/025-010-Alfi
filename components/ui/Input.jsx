import React from "react";
import { View } from "react-native";
import { TextInput, Text, IconButton, useTheme } from "react-native-paper";

/**
 * Wrapper component for React Native Paper TextInput
 * Maintains compatibility with existing Input usage
 * while providing Material Design styling
 */
const Input = ({
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
  mode = "outlined",
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const paperTheme = useTheme();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <TextInput
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        mode={mode}
        multiline={multiline}
        numberOfLines={numberOfLines}
        error={!!error}
        style={{
          backgroundColor: paperTheme.colors.surface,
        }}
        contentStyle={{
          fontSize: 16,
        }}
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={isPasswordVisible ? "eye" : "eye-off"}
              onPress={togglePasswordVisibility}
            />
          ) : null
        }
        {...props}
      />
      {error && (
        <Text
          variant="bodySmall"
          style={{
            color: paperTheme.colors.error,
            marginTop: 4,
            marginLeft: 16,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;