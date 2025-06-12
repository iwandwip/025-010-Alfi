import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { getColors } from '../../constants/Colors';

const CreditBalance = ({ creditBalance = 0, style }) => {
  const { theme } = useSettings();
  const colors = getColors(theme);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (creditBalance <= 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.primary + '10' }, style]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>💰</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: colors.gray600 }]}>
          Saldo Credit
        </Text>
        <Text style={[styles.amount, { color: colors.primary }]}>
          {formatCurrency(creditBalance || 0)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreditBalance;