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

// Theme Colors
export const Colors = {
  primary: '#2196F3',
  secondary: '#1976D2',
  success: '#2196F3',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  green: '#2196F3',
  blue: '#2196F3',
  red: '#F44336',
  orange: '#FF9800',
  purple: '#9C27B0',
  teal: '#009688',
  pink: '#E91E63',
};

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
export const VStack = ({ children, space, style, ...props }) => (
  <View style={[styles.vstack, space && { gap: space * 4 }, style]} {...props}>
    {children}
  </View>
);

// HStack Component (horizontal stack)
export const HStack = ({ children, space, style, alignItems, justifyContent, ...props }) => (
  <View style={[
    styles.hstack, 
    space && { gap: space * 4 },
    alignItems && { alignItems },
    justifyContent && { justifyContent },
    style
  ]} {...props}>
    {children}
  </View>
);

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
  
  // Shadow Styles
  shadow1: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shadow2: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  shadow3: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  shadow4: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  
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