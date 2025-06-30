import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Colors, getThemeByRole } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";

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
  ...props
}) => {
  const { isAdmin } = useAuth();
  const theme = getThemeByRole(isAdmin);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getInputContainerStyle = () => {
    const baseStyle = {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.gray300,
      borderRadius: 8,
      backgroundColor: theme.white,
      minHeight: 48,
    };

    if (error) {
      return { ...baseStyle, borderColor: theme.error };
    }
    if (isFocused) {
      return { ...baseStyle, borderColor: theme.primary };
    }
    if (multiline) {
      return { ...baseStyle, alignItems: "flex-start", minHeight: 80 };
    }

    return baseStyle;
  };

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: theme.gray700,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      )}
      <View style={getInputContainerStyle()}>
        <TextInput
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: theme.gray900,
            textAlignVertical: multiline ? "top" : "center",
          }}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={theme.gray400}
          multiline={multiline}
          numberOfLines={numberOfLines}
          blurOnSubmit={!multiline}
          returnKeyType={multiline ? "default" : "done"}
          autoCorrect={false}
          spellCheck={false}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 16 }}>
              {isPasswordVisible ? "👁️" : "🙈"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: theme.error,
            marginTop: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};


export default Input;
