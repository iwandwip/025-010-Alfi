import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, ScrollView, RefreshControl, AppState, StyleSheet } from "react-native";
import {
  Surface,
  Text,
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  ProgressBar,
  useTheme,
  Modal,
  Portal,
  ActivityIndicator,
  Divider,
  FAB
} from "react-native-paper";
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
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';

function StatusSetoran() {
  const { userProfile } = useAuth();
  const { theme, loading: settingsLoading } = useSettings();
  const { 
    showPaymentSuccessNotification, 
    showErrorNotification,
    showPaymentWithCreditNotification,
    showCreditBalanceNotification
  } = useNotification();
  const paperTheme = useTheme();
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

  useEffect(() => {
    if (!settingsLoading) {
      loadData(false, true);
    }
  }, [loadData, settingsLoading]);

  useFocusEffect(
    useCallback(() => {
      paymentStatusManager.handlePageNavigation(
        "payment-status",
        userProfile?.id
      );
    }, [userProfile?.id])
  );

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      paymentStatusManager.handleAppStateChange(nextAppState, userProfile?.id);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [userProfile?.id]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  const getStatusInfo = useCallback((status) => {
    switch (status) {
      case "lunas":
        return { label: "Lunas", icon: "check-circle", color: paperTheme.colors.success };
      case "belum_bayar":
        return { label: "Belum Bayar", icon: "clock", color: paperTheme.colors.error };
      case "terlambat":
        return { label: "Terlambat", icon: "alert-circle", color: paperTheme.colors.warning };
      default:
        return { label: "Unknown", icon: "help-circle", color: paperTheme.colors.outline };
    }
  }, [paperTheme]);


  const renderSummaryCard = useMemo(() => {
    if (!summary) return null;

    return (
      <Animated.View entering={FadeInDown.delay(100)}>
        <Card style={styles.summaryCard} mode="elevated">
          <Card.Content>
            <View style={styles.summaryHeader}>
              <Avatar.Icon 
                size={48} 
                icon="chart-pie" 
                style={{ backgroundColor: paperTheme.colors.primaryContainer }}
                color={paperTheme.colors.onPrimaryContainer}
              />
              <View style={styles.summaryTitle}>
                <Text variant="titleLarge" style={{ fontWeight: '600' }}>
                  Ringkasan Setoran
                </Text>
                <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                  Progress pembayaran Anda
                </Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text variant="bodyMedium">
                  Progress: {summary.lunas || 0}/{summary.total || 0} periode
                </Text>
                <Text variant="titleMedium" style={{ color: paperTheme.colors.primary, fontWeight: 'bold' }}>
                  {summary.progressPercentage || 0}%
                </Text>
              </View>
              <ProgressBar 
                progress={(summary.progressPercentage || 0) / 100} 
                color={paperTheme.colors.primary}
                style={styles.progressBar}
              />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={{ color: paperTheme.colors.success, fontWeight: 'bold' }}>
                  {summary.lunas || 0}
                </Text>
                <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                  Lunas
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={{ color: paperTheme.colors.error, fontWeight: 'bold' }}>
                  {summary.belumBayar || 0}
                </Text>
                <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                  Belum Bayar
                </Text>
              </View>

              {(summary.terlambat || 0) > 0 && (
                <View style={styles.statItem}>
                  <Text variant="headlineMedium" style={{ color: paperTheme.colors.warning, fontWeight: 'bold' }}>
                    {summary.terlambat || 0}
                  </Text>
                  <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    Terlambat
                  </Text>
                </View>
              )}
            </View>

            <Divider style={styles.divider} />

            <View style={styles.amountSection}>
              <View style={styles.amountRow}>
                <Text variant="bodyMedium">Total Tagihan:</Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {formatCurrency(summary.totalAmount || 0)}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text variant="bodyMedium">Sudah Disetor:</Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: paperTheme.colors.success }}>
                  {formatCurrency(summary.paidAmount || 0)}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text variant="bodyMedium">Belum Disetor:</Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: paperTheme.colors.error }}>
                  {formatCurrency(summary.unpaidAmount || 0)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  }, [summary, paperTheme, formatCurrency]);

  const renderCreditCard = useMemo(() => {
    if (!creditBalance || creditBalance <= 0) return null;

    return (
      <Animated.View entering={FadeInDown.delay(200)}>
        <Card style={styles.creditCard} mode="elevated">
          <Card.Content>
            <View style={styles.creditHeader}>
              <Avatar.Icon 
                size={40} 
                icon="wallet" 
                style={{ backgroundColor: paperTheme.colors.tertiaryContainer }}
                color={paperTheme.colors.onTertiaryContainer}
              />
              <View style={styles.creditInfo}>
                <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                  Saldo Kredit
                </Text>
                <Text variant="headlineSmall" style={{ color: paperTheme.colors.tertiary, fontWeight: 'bold' }}>
                  {formatCurrency(creditBalance)}
                </Text>
              </View>
              <Chip icon="star" mode="flat" style={{ backgroundColor: paperTheme.colors.successContainer }}>
                Aktif
              </Chip>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  }, [creditBalance, paperTheme, formatCurrency]);

  const renderPaymentItem = useCallback((item, index) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <Animated.View 
        entering={SlideInRight.delay(300 + (index * 100)).springify()}
        key={item.id}
      >
        <Card style={styles.paymentCard} mode="outlined">
          <Card.Content>
            <View style={styles.paymentHeader}>
              <View style={styles.paymentInfo}>
                <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                  {item.periodData?.label}
                </Text>
                <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                  Periode {item.periodData?.number}
                </Text>
              </View>
              
              <Chip 
                icon={statusInfo.icon}
                mode="flat"
                style={{ backgroundColor: `${statusInfo.color}20` }}
                textStyle={{ color: statusInfo.color }}
              >
                {statusInfo.label}
              </Chip>
            </View>

            <View style={styles.paymentDetails}>
              <View style={styles.detailRow}>
                <Text variant="bodyMedium">Nominal:</Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {formatCurrency(item.amount || 0)}
                </Text>
              </View>

              {(item.creditApplied || 0) > 0 && (
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={{ color: paperTheme.colors.tertiary }}>
                    Credit Applied:
                  </Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: paperTheme.colors.tertiary }}>
                    -{formatCurrency(item.creditApplied || 0)}
                  </Text>
                </View>
              )}

              {item.paymentDate && (
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium">Tanggal Bayar:</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {formatDate(item.paymentDate)}
                  </Text>
                </View>
              )}

              {item.paymentMethod && (
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium">Metode:</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {item.paymentMethod === "tunai" ? "Tunai" : "Online"}
                  </Text>
                </View>
              )}
            </View>

            {(item.status === "belum_bayar" || item.status === "terlambat") && (
              <View style={styles.paymentInfoBox}>
                <MaterialIcons name="info-outline" size={20} color={paperTheme.colors.primary} />
                <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant, flex: 1, marginLeft: 8 }}>
                  Pembayaran dilakukan melalui alat ESP32 dengan tap RFID
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
    );
  }, [getStatusInfo, paperTheme, formatCurrency, updatingPayment]);

  if (settingsLoading || loading) {
    return (
      <View style={[styles.container, { backgroundColor: paperTheme.colors.background, paddingTop: insets.top }]}>
        <Surface style={styles.header} elevation={2}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Status Setoran Jimpitan
          </Text>
          {userProfile && (
            <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
              Warga: {userProfile.namaWarga}
            </Text>
          )}
        </Surface>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" animating />
          <Text variant="bodyLarge" style={{ marginTop: 16 }}>
            Memuat data pembayaran...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background, paddingTop: insets.top }]}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Status Setoran Jimpitan
        </Text>
        {userProfile && (
          <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
            Warga: {userProfile.namaWarga}
          </Text>
        )}
        {timeline && (
          <Text variant="bodySmall" style={{ color: paperTheme.colors.primary, fontWeight: '500' }}>
            Timeline: {timeline.name}
          </Text>
        )}
      </Surface>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[paperTheme.colors.primary]}
            tintColor={paperTheme.colors.primary}
            title="Memuat ulang..."
          />
        }
      >
        {renderSummaryCard}
        {renderCreditCard}

        {payments.length > 0 ? (
          <View style={styles.paymentsSection}>
            <Text variant="titleLarge" style={[styles.sectionTitle, { marginBottom: 16 }]}>
              Riwayat Pembayaran
            </Text>
            {payments.map(renderPaymentItem)}
          </View>
        ) : (
          <Animated.View entering={FadeInUp.delay(400)} style={styles.emptyContainer}>
            <Avatar.Icon 
              size={80} 
              icon="calendar-clock" 
              style={{ backgroundColor: paperTheme.colors.surfaceVariant }}
              color={paperTheme.colors.onSurfaceVariant}
            />
            <Text variant="headlineSmall" style={[styles.emptyTitle, { color: paperTheme.colors.onSurfaceVariant }]}>
              {timeline ? "Belum ada data pembayaran" : "Belum ada timeline aktif"}
            </Text>
            <Text variant="bodyMedium" style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}>
              {timeline
                ? "Data pembayaran akan muncul setelah admin membuat timeline"
                : "Admin belum membuat timeline pembayaran"}
            </Text>
          </Animated.View>
        )}
      </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  summaryTitle: {
    flex: 1,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  divider: {
    marginBottom: 16,
  },
  amountSection: {
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  creditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  creditInfo: {
    flex: 1,
  },
  paymentsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  paymentCard: {
    marginBottom: 12,
    borderRadius: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingModal: {
    margin: 20,
    borderRadius: 16,
  },
  loadingModalContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});

export default StatusSetoran;