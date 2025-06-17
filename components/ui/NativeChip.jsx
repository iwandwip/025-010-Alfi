import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';

const NativeChip = ({ 
  children, 
  icon, 
  mode = 'flat',
  style, 
  textStyle,
  backgroundColor,
  textColor,
  ...props 
}) => {
  const getChipStyle = () => {
    const baseStyle = [styles.chip];
    
    if (mode === 'outlined') {
      baseStyle.push(styles.outlined);
    }
    
    if (backgroundColor) {
      baseStyle.push({ backgroundColor });
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];
    
    if (textColor) {
      baseStyle.push({ color: textColor });
    }
    
    return baseStyle;
  };

  return (
    <View style={[...getChipStyle(), style]} {...props}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[...getTextStyle(), textStyle]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surfaceVariant,
    alignSelf: 'flex-start',
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    ...Typography.caption,
    fontWeight: '500',
  },
  icon: {
    marginRight: 4,
  },
});

export default NativeChip;