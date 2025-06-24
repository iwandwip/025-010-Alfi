import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  ScrollView, 
  RefreshControl, 
  StyleSheet, 
  Text,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useNotification } from "../../contexts/NotificationContext";
import { formatDate } from "../../utils/dateUtils";
import { paymentStatusManager } from "../../services/paymentStatusManager";
import {
  getWargaPaymentHistory,
  getPaymentSummary,
  getCreditBalance,
} from "../../services/wargaPaymentService";
import { Typography, Spacing, BorderRadius, Shadows } from "../../constants/theme";
import { useRoleTheme } from '../../hooks/useRoleTheme';
import { CardStyles } from "../../constants/CardStyles";
import NativeCard from "../../components/ui/NativeCard";
import NativeChip from "../../components/ui/NativeChip";
import NativeButton from "../../components/ui/NativeButton";

function StatusSetoran() {
  const { userProfile } = useAuth();
  const { colors } = useRoleTheme();
  const styles = createStyles(colors);
  const { theme, loading: settingsLoading } = useSettings();
  const { 
    showPaymentSuccessNotification, 
    showErrorNotification,
    showPaymentWithCreditNotification,
    showCreditBalanceNotification
  } = useNotification();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [timeline, setTimeline] = useState(null);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);

  const loadData = useCallback(
    async (isRefresh = false, useCache = true) => {
      try {
        if (!userProfile?.id) {
          setPayments([]);
          setSummary(null);
          setTimeline(null);
          setLoading(false);
          return;
        }

        if (!isRefresh) setLoading(true);

        const result = await paymentStatusManager.updateUserPaymentStatus(
          userProfile.id,
          !useCache,
          isRefresh ? "manual_refresh" : "page_load"
        );

        if (result.success && result.data) {
          setPayments(result.data.payments || []);
          setTimeline(result.data.timeline);
          setSummary(getPaymentSummary(result.data.payments || []));
        } else {
          const fallbackResult = await getWargaPaymentHistory(userProfile.id);
          if (fallbackResult.success) {
            setPayments(fallbackResult.payments);
            setTimeline(fallbackResult.timeline);
            setSummary(getPaymentSummary(fallbackResult.payments));
          } else {
            setPayments([]);
            setSummary(null);
            setTimeline(null);
          }
        }

        const creditResult = await getCreditBalance(userProfile.id);
        if (creditResult.success) {
          setCreditBalance(creditResult.creditBalance);
        }
      } catch (error) {
        console.error("Error loading payment data:", error);
        setPayments([]);
        setSummary(null);
        setTimeline(null);
      } finally {
        setLoading(false);
      }
    },
    [userProfile?.id]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(true, false);
    setRefreshing(false);
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const getStatusInfo = (payment) => {
    if (!payment) return { label: 'N/A', color: colors.textDisabled, icon: 'help' };
    
    switch (payment.status) {
      case 'lunas':
        return { label: 'Lunas', color: colors.lunas, icon: 'check-circle' };
      case 'terlambat':
        return { label: 'Terlambat', color: colors.terlambat, icon: 'warning' };
      case 'belum_bayar':
      default:
        return { label: 'Belum Bayar', color: colors.belumBayar, icon: 'pending' };
    }
  };

  const renderPaymentCard = (item, index) => {
    const statusInfo = getStatusInfo(item);
    
    return (
      <NativeCard key={index} style={styles.paymentCard} mode="outlined">
        <NativeCard.Content>
          <View style={styles.paymentHeader}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>
                {item.periodData?.label || 'Unknown Period'}
              </Text>
              <Text style={styles.paymentSubtitle}>
                Periode {item.periodData?.number || 'N/A'}
              </Text>
            </View>
            
            <NativeChip 
              icon={<MaterialIcons name={statusInfo.icon} size={16} color={statusInfo.color} />}
              backgroundColor={statusInfo.color + '20'}
              textColor={statusInfo.color}
            >
              {statusInfo.label}
            </NativeChip>
          </View>
          
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentAmount}>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(item.amount || 0)}
            </Text>
            
            {item.dueDate && (
              <Text style={styles.paymentDate}>
                Jatuh tempo: {formatDate(item.dueDate)}
              </Text>
            )}
            
            {item.paymentDate && (
              <Text style={styles.paymentDate}>
                Dibayar: {formatDate(item.paymentDate)}
              </Text>
            )}
          </View>
        </NativeCard.Content>
      </NativeCard>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat data setoran...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Status Setoran Jimpitan</Text>
        {userProfile && (
          <Text style={styles.headerSubtitle}>
            {userProfile.namaWarga || userProfile.nama || 'Warga'}
          </Text>
        )}
      </View>

      {creditBalance > 0 && (
        <View style={styles.creditContainer}>
          <NativeCard style={[styles.creditCard, { backgroundColor: colors.success + '10' }]}>
            <NativeCard.Content>
              <View style={styles.creditContent}>
                <MaterialIcons name="account-balance-wallet" size={24} color={colors.success} />
                <View style={styles.creditInfo}>
                  <Text style={styles.creditLabel}>Saldo Kredit</Text>
                  <Text style={[styles.creditAmount, { color: colors.success }]}>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(creditBalance)}
                  </Text>
                </View>
              </View>
            </NativeCard.Content>
          </NativeCard>
        </View>
      )}

      {summary && (
        <View style={styles.summaryContainer}>
          <NativeCard style={styles.summaryCard}>
            <NativeCard.Content>
              <Text style={styles.summaryTitle}>Ringkasan Setoran</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{summary.total}</Text>
                  <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.lunas }]}>{summary.lunas}</Text>
                  <Text style={styles.summaryLabel}>Lunas</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.terlambat }]}>{summary.terlambat}</Text>
                  <Text style={styles.summaryLabel}>Terlambat</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.belumBayar }]}>{summary.belum_bayar}</Text>
                  <Text style={styles.summaryLabel}>Belum Bayar</Text>
                </View>
              </View>
            </NativeCard.Content>
          </NativeCard>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="Tarik untuk memuat ulang..."
          />
        }
      >
        {payments.length > 0 ? (
          payments.map(renderPaymentCard)
        ) : (
          <NativeCard style={styles.emptyCard}>
            <NativeCard.Content style={styles.emptyContent}>
              <MaterialIcons name="receipt-long" size={48} color={colors.textDisabled} />
              <Text style={styles.emptyTitle}>Belum ada data setoran</Text>
              <Text style={styles.emptySubtitle}>
                Data setoran akan muncul setelah timeline dibuat oleh bendahara
              </Text>
            </NativeCard.Content>
          </NativeCard>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: colors.surface,
    ...Shadows.sm,
  },
  headerTitle: {
    ...Typography.h3,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    ...Typography.body2,
    color: colors.textSecondary,
  },
  loadingText: {
    ...Typography.body2,
    marginTop: Spacing.sm,
    color: colors.textSecondary,
  },
  creditContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  creditCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  creditContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  creditInfo: {
    flex: 1,
  },
  creditLabel: {
    ...Typography.caption,
    color: colors.textSecondary,
  },
  creditAmount: {
    ...Typography.h4,
    fontWeight: '600',
  },
  summaryContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  summaryCard: {
    backgroundColor: colors.primary + '10',
  },
  summaryTitle: {
    ...Typography.body1,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...Typography.h4,
    fontWeight: '700',
  },
  summaryLabel: {
    ...Typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  paymentCard: {
    marginBottom: Spacing.sm,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    ...Typography.body1,
    fontWeight: '600',
  },
  paymentSubtitle: {
    ...Typography.caption,
    color: colors.textSecondary,
  },
  paymentDetails: {
    gap: 4,
  },
  paymentAmount: {
    ...Typography.h4,
    fontWeight: '600',
    color: colors.primary,
  },
  paymentDate: {
    ...Typography.caption,
    color: colors.textSecondary,
  },
  emptyCard: {
    marginTop: Spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h4,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default StatusSetoran;