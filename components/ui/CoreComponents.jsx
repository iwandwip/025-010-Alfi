import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Shadows } from '../../constants/theme';
import { lightTheme } from '../../constants/Colors';

// Use lightTheme colors for consistency
export const Colors = lightTheme;

// Container Component
export const Container = ({ children, style, ...props }) => (
  <View style={[styles.container, style]} {...props}>
    {children}
  </View>
);

// Box Component (replaces NativeBase Box)
export const Box = ({ children, style, bg, p, px, py, m, mx, my, rounded, shadow, ...props }) => {
  const boxStyle = [
    bg && { backgroundColor: Colors[bg] || bg },
    p && { padding: p * 4 },
    px && { paddingHorizontal: px * 4 },
    py && { paddingVertical: py * 4 },
    m && { margin: m * 4 },
    mx && { marginHorizontal: mx * 4 },
    my && { marginVertical: my * 4 },
    rounded && { borderRadius: rounded === 'lg' ? 12 : rounded === 'md' ? 8 : rounded === 'sm' ? 4 : rounded },
    shadow && styles[`shadow${shadow}`],
    style,
  ];
  
  return (
    <View style={boxStyle} {...props}>
      {children}
    </View>
  );
};

// VStack Component (vertical stack)
export const VStack = ({ children, space, style, ...props }) => {
  const childrenWithSpacing = space 
    ? React.Children.map(children, (child, index) => (
        index > 0 ? 
          <View key={index} style={{ marginTop: space * 4 }}>{child}</View> :
          <View key={index}>{child}</View>
      ))
    : children;
    
  return (
    <View style={[styles.vstack, style]} {...props}>
      {childrenWithSpacing}
    </View>
  );
};

// HStack Component (horizontal stack)
export const HStack = ({ children, space, style, alignItems, justifyContent, ...props }) => {
  const childrenWithSpacing = space 
    ? React.Children.map(children, (child, index) => (
        index > 0 ? 
          <View key={index} style={{ marginLeft: space * 4 }}>{child}</View> :
          <View key={index}>{child}</View>
      ))
    : children;
    
  return (
    <View style={[
      styles.hstack, 
      alignItems && { alignItems },
      justifyContent && { justifyContent },
      style
    ]} {...props}>
      {childrenWithSpacing}
    </View>
  );
};

// Center Component
export const Center = ({ children, style, ...props }) => (
  <View style={[styles.center, style]} {...props}>
    {children}
  </View>
);

// Custom Text Component
export const CustomText = ({ children, style, fontSize, color, fontWeight, textAlign, ...props }) => {
  const textStyle = [
    fontSize && styles[`text${fontSize}`],
    color && { color: Colors[color] || color },
    fontWeight && { fontWeight },
    textAlign && { textAlign },
    style,
  ];
  
  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

// Heading Component
export const Heading = ({ children, size, style, color, ...props }) => {
  const headingStyle = [
    styles.heading,
    size && styles[`heading${size}`],
    color && { color: Colors[color] || color },
    style,
  ];
  
  return (
    <Text style={headingStyle} {...props}>
      {children}
    </Text>
  );
};

// Button Component
export const Button = ({ 
  title, 
  onPress, 
  disabled, 
  loading, 
  variant = 'primary', 
  size = 'md',
  style,
  textStyle,
  ...props 
}) => {
  const buttonStyle = [
    styles.button,
    styles[`button${size}`],
    styles[`button${variant}`],
    disabled && styles.buttonDisabled,
    style,
  ];
  
  const buttonTextStyle = [
    styles.buttonText,
    styles[`buttonText${size}`],
    styles[`buttonText${variant}`],
    disabled && styles.buttonTextDisabled,
    textStyle,
  ];
  
  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.white} />
      ) : (
        <Text style={buttonTextStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// Input Component
export const Input = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  style,
  error,
  label,
  ...props
}) => {
  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholderTextColor={Colors.gray400}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Loading Spinner
export const LoadingSpinner = ({ size = 'large', color = Colors.primary }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

// Modal Component
export const CustomModal = ({ visible, onClose, children, ...props }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
    {...props}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        {children}
      </View>
    </View>
  </Modal>
);

// SafeArea Component
export const SafeArea = ({ children, style, ...props }) => (
  <SafeAreaView style={[styles.safeArea, style]} {...props}>
    {children}
  </SafeAreaView>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  vstack: {
    flexDirection: 'column',
  },
  hstack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Text Styles
  textxs: { fontSize: 12 },
  textsm: { fontSize: 14 },
  textmd: { fontSize: 16 },
  textlg: { fontSize: 18 },
  textxl: { fontSize: 20 },
  text2xl: { fontSize: 24 },
  
  // Heading Styles
  heading: {
    fontWeight: 'bold',
    color: Colors.gray900,
  },
  headingsm: { fontSize: 18 },
  headingmd: { fontSize: 20 },
  headinglg: { fontSize: 24 },
  headingxl: { fontSize: 28 },
  heading2xl: { fontSize: 32 },
  
  // Button Styles
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonsm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  buttonmd: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  buttonlg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  buttonprimary: {
    backgroundColor: Colors.primary,
  },
  buttonoutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonsecondary: {
    backgroundColor: Colors.gray200,
  },
  buttonDisabled: {
    backgroundColor: Colors.gray300,
    opacity: 0.6,
  },
  
  // Button Text Styles
  buttonText: {
    fontWeight: '600',
  },
  buttonTextsm: { fontSize: 14 },
  buttonTextmd: { fontSize: 16 },
  buttonTextlg: { fontSize: 18 },
  buttonTextprimary: {
    color: Colors.white,
  },
  buttonTextoutline: {
    color: Colors.primary,
  },
  buttonTextsecondary: {
    color: Colors.gray700,
  },
  buttonTextDisabled: {
    color: Colors.gray500,
  },
  
  // Input Styles
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray700,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    color: Colors.gray900,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
  
  // Shadow Styles - Using consistent theme shadows
  shadow1: Shadows.sm,
  shadow2: Shadows.md,
  shadow3: Shadows.lg,
  shadow4: Shadows.lg,
  
  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  
  // Safe Area
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});

export default {
  Container,
  Box,
  VStack,
  HStack,
  Center,
  CustomText,
  Heading,
  Button,
  Input,
  LoadingSpinner,
  CustomModal,
  SafeArea,
  Colors,
};