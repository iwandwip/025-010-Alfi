import React from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * Custom Input component with Material Design styling
 * Maintains compatibility with existing Input usage
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
  const [isFocused, setIsFocused] = React.useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getInputStyle = () => {
    const baseStyle = {
      fontSize: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: '#FFFFFF',
      minHeight: 48,
    };

    if (error) {
      return {
        ...baseStyle,
        borderColor: '#F44336',
      };
    }

    if (isFocused) {
      return {
        ...baseStyle,
        borderColor: '#F50057',
      };
    }

    return {
      ...baseStyle,
      borderColor: '#E0E0E0',
    };
  };

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {label && (
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: '#333',
          marginBottom: 8,
        }}>
          {label}
        </Text>
      )}
      
      <View style={{ position: 'relative' }}>
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            getInputStyle(),
            secureTextEntry ? { paddingRight: 48 } : {},
            multiline ? { textAlignVertical: 'top' } : {},
          ]}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={{
              position: 'absolute',
              right: 12,
              top: 12,
              padding: 4,
            }}
          >
            <MaterialIcons
              name={isPasswordVisible ? "visibility" : "visibility-off"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={{
          fontSize: 12,
          color: '#F44336',
          marginTop: 4,
          marginLeft: 4,
        }}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;