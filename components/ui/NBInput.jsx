import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { lightTheme } from '../../constants/Colors';

const NBInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
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

  const getInputStyle = () => ({
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: error ? lightTheme.error : (isFocused ? lightTheme.primary : lightTheme.gray300),
    backgroundColor: lightTheme.white,
    color: lightTheme.gray900,
    minHeight: multiline ? numberOfLines * 20 + 24 : 48,
    textAlignVertical: multiline ? 'top' : 'center',
  });

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {label && (
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: lightTheme.gray700,
          marginBottom: 8,
        }}>
          {label}{isRequired && <Text style={{ color: lightTheme.error }}> *</Text>}
        </Text>
      )}
      
      <View style={{ position: 'relative' }}>
        {leftElement && (
          <View style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: [{ translateY: -12 }],
            zIndex: 1,
          }}>
            {leftElement}
          </View>
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={lightTheme.gray400}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            getInputStyle(),
            leftElement && { paddingLeft: 48 },
            (rightElement || secureTextEntry) && { paddingRight: 48 },
          ]}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: [{ translateY: -12 }],
              zIndex: 1,
            }}
          >
            <MaterialIcons
              name={isPasswordVisible ? 'visibility' : 'visibility-off'}
              size={20}
              color={lightTheme.gray400}
            />
          </TouchableOpacity>
        )}

        {rightElement && !secureTextEntry && (
          <View style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: [{ translateY: -12 }],
            zIndex: 1,
          }}>
            {rightElement}
          </View>
        )}
      </View>
      
      {helperText && !error && (
        <Text style={{
          fontSize: 12,
          color: lightTheme.gray600,
          marginTop: 4,
        }}>
          {helperText}
        </Text>
      )}
      
      {error && (
        <Text style={{
          fontSize: 12,
          color: lightTheme.error,
          marginTop: 4,
        }}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default NBInput;