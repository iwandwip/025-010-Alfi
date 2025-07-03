import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  AppState,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useNotification } from "../../contexts/NotificationContext";
import { lightTheme } from "../../constants/Colors";
import PaymentModal from "../../components/ui/PaymentModal";
import CreditBalance from "../../components/ui/CreditBalance";
import { formatDate } from "../../utils/dateUtils";
import { paymentStatusManager } from "../../services/paymentStatusManager";
import {
  getWargaPaymentHistory,
  getPaymentSummary,
  updateWargaPaymentStatus,
  getCreditBalance,
  processPaymentWithCredit,
} from "../../services/wargaPaymentService";

function StatusPembayaran() {
  const { userProfile, isAdmin } = useAuth();
  const { theme, loading: settingsLoading } = useSettings();
  const { 
    showPaymentSuccessNotification, 
    showErrorNotification,
    showPaymentWithCreditNotification,
    showCreditBalanceNotification
  } = useNotification();
  const colors = lightTheme;
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [timeline, setTimeline] = useState(null);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
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

  useEffect(() => {
    const unsubscribe = paymentStatusManager.addListener((type, data) => {
      if (type === "user_payment_updated" && data.userId === userProfile?.id) {
        if (data.data.success) {
          setPayments(data.data.payments || []);
          setTimeline(data.data.timeline);
          setSummary(getPaymentSummary(data.data.payments || []));
        }
      }
    });

    return unsubscribe;
  }, [userProfile?.id]);

  const handlePayNow = useCallback((payment) => {
    setSelectedPayment(payment);
    setPaymentModalVisible(true);
  }, []);

  const handlePaymentSuccess = useCallback(
    async (payment, paymentMethod, customAmount = null) => {
      setUpdatingPayment(true);

      try {
        // Handle partial payment (hardware_cash_partial)
        if (paymentMethod === 'hardware_cash_partial') {
          // For partial payment, add amount to credit balance only
          const result = await processPaymentWithCredit(
            timeline.id,
            payment.periodKey,
            userProfile.id,
            0, // No actual payment to the period
            'credit_only', // Special method for credit addition
            customAmount // The partial amount to add as credit
          );
          
          if (result.success) {
            await loadData(true, false);
            showCreditBalanceNotification(result.newCreditBalance);
            paymentStatusManager.clearUserCache(userProfile.id);
          } else {
            showErrorNotification(
              "Gagal memperbarui status pembayaran: " + result.error
            );
          }
        } else {
          // Normal payment processing
          const paymentAmount = customAmount || (payment.remainingAmount || payment.amount);
          
          const result = await processPaymentWithCredit(
            timeline.id,
            payment.periodKey,
            userProfile.id,
            paymentAmount,
            paymentMethod
          );

          if (result.success) {
            await loadData(true, false);
            
            // Show appropriate notification based on result
            if (result.excessCredit > 0) {
              showPaymentWithCreditNotification(
                payment, 
                result.creditApplied, 
                0 // remaining amount is 0 since payment is complete
              );
              showCreditBalanceNotification(result.newCreditBalance);
            } else if (result.creditApplied > 0) {
              showPaymentWithCreditNotification(
                payment, 
                result.creditApplied, 
                0
              );
            } else {
              showPaymentSuccessNotification(payment);
            }

            paymentStatusManager.clearUserCache(userProfile.id);
          } else {
            showErrorNotification(
              "Gagal memperbarui status pembayaran: " + result.error
            );
          }
        }
      } catch (error) {
        showErrorNotification("Terjadi kesalahan saat memperbarui pembayaran");
        console.error("Error updating payment:", error);
      }

      setUpdatingPayment(false);
    },
    [
      timeline?.id,
      userProfile?.id,
      loadData,
      showPaymentSuccessNotification,
      showPaymentWithCreditNotification,
      showCreditBalanceNotification,
      showErrorNotification,
    ]
  );

  const getStatusColor = useCallback(
    (status) => {
      switch (status) {
        case "lunas":
          return colors.success;
        case "belum_bayar":
          return colors.error;
        case "terlambat":
          return colors.warning;
        default:
          return colors.gray500;
      }
    },
    [colors]
  );

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);


  const getStatusLabel = useCallback((status) => {
    switch (status) {
      case "lunas":
        return "Lunas";
      case "belum_bayar":
        return "Belum Bayar";
      case "terlambat":
        return "Terlambat";
      default:
        return "Unknown";
    }
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case "lunas":
        return "✅";
      case "belum_bayar":
        return "❌";
      case "terlambat":
        return "⚠️";
      default:
        return "❓";
    }
  }, []);

  const renderSummaryCard = useMemo(() => {
    if (!summary) return null;

    return (
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: colors.white, borderColor: colors.gray200 },
        ]}
      >
        <Text style={[styles.summaryTitle, { color: colors.gray900 }]}>
          Ringkasan Pembayaran
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, { color: colors.gray700 }]}>
              Progress: {summary.lunas || 0}/{summary.total || 0} periode
            </Text>
            <Text
              style={[styles.progressPercentage, { color: colors.primary }]}
            >
              {summary.progressPercentage || 0}%
            </Text>
          </View>

          <View
            style={[styles.progressBar, { backgroundColor: colors.gray200 }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.success,
                  width: `${summary.progressPercentage || 0}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>
                {summary.lunas || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.gray600 }]}>
                Lunas
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.error }]}>
                {summary.belumBayar || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.gray600 }]}>
                Belum Bayar
              </Text>
            </View>

            {(summary.terlambat || 0) > 0 && (
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.warning }]}>
                  {summary.terlambat || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.gray600 }]}>
                  Terlambat
                </Text>
              </View>
            )}
          </View>

          <View style={styles.amountSummary}>
            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: colors.gray600 }]}>
                Total Tagihan:
              </Text>
              <Text style={[styles.amountValue, { color: colors.gray900 }]}>
                {formatCurrency(summary.totalAmount || 0)}
              </Text>
            </View>

            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: colors.gray600 }]}>
                Sudah Dibayar:
              </Text>
              <Text style={[styles.amountValue, { color: colors.success }]}>
                {formatCurrency(summary.paidAmount || 0)}
              </Text>
            </View>

            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: colors.gray600 }]}>
                Belum Dibayar:
              </Text>
              <Text style={[styles.amountValue, { color: colors.error }]}>
                {formatCurrency(summary.unpaidAmount || 0)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }, [summary, colors, formatCurrency]);

  const renderPaymentItem = useCallback(
    ({ item }) => (
      <View
        style={[
          styles.paymentCard,
          { backgroundColor: colors.white, borderLeftColor: colors.primary, borderLeftWidth: 4 },
        ]}
      >
        {/* Modern Compact Header */}
        <View style={styles.modernHeader}>
          <View style={[styles.periodBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.periodBadgeText, { color: colors.white }]}>
              #{item.periodData.number}
            </Text>
          </View>
          <View style={styles.headerContent}>
            <Text style={[styles.periodTitle, { color: colors.gray900 }]}>
              {item.periodData.label}
            </Text>
            <Text style={[styles.amountDisplay, { color: colors.primary }]}>
              {formatCurrency(item.amount || 0)}
            </Text>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={[styles.statusIcon, { color: colors.white }]}>
              {getStatusIcon(item.status)}
            </Text>
          </View>
        </View>

        {/* Compact Info Grid */}
        <View style={styles.infoGrid}>
          {(item.creditApplied || 0) > 0 && (
            <View style={styles.infoChip}>
              <Text style={[styles.chipLabel, { color: colors.success }]}>Credit</Text>
              <Text style={[styles.chipValue, { color: colors.success }]}>
                -{formatCurrency(item.creditApplied || 0)}
              </Text>
            </View>
          )}

          {(item.remainingAmount || 0) > 0 && (item.remainingAmount || 0) < (item.amount || 0) && (
            <View style={styles.infoChip}>
              <Text style={[styles.chipLabel, { color: colors.warning }]}>Sisa</Text>
              <Text style={[styles.chipValue, { color: colors.warning }]}>
                {formatCurrency(item.remainingAmount || 0)}
              </Text>
            </View>
          )}

          {item.paymentDate && (
            <View style={styles.infoChip}>
              <Text style={[styles.chipLabel, { color: colors.gray600 }]}>Dibayar</Text>
              <Text style={[styles.chipValue, { color: colors.gray800 }]}>
                {formatDate(item.paymentDate)}
              </Text>
            </View>
          )}

          {item.paymentMethod && (
            <View style={styles.infoChip}>
              <Text style={[styles.chipLabel, { color: colors.gray600 }]}>Metode</Text>
              <Text style={[styles.chipValue, { color: colors.gray800 }]}>
                {item.paymentMethod === "tunai" ? "Tunai" : "Online"}
              </Text>
            </View>
          )}
        </View>

        {(item.status === "belum_bayar" || item.status === "terlambat") && (
          <TouchableOpacity
            style={[
              styles.compactPayButton, 
              { 
                backgroundColor: item.status === "terlambat" ? colors.warning : colors.primary 
              }
            ]}
            onPress={() => handlePayNow(item)}
            disabled={updatingPayment}
          >
            {updatingPayment ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <View style={styles.payButtonContent}>
                <Text style={[styles.payButtonIcon, { color: colors.white }]}>
                  {item.status === "terlambat" ? "⚡" : "💳"}
                </Text>
                <Text style={[styles.payButtonLabel, { color: colors.white }]}>
                  Bayar {formatCurrency((item.remainingAmount || item.amount) || 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    ),
    [
      colors,
      getStatusColor,
      getStatusIcon,
      getStatusLabel,
      formatCurrency,
      handlePayNow,
      updatingPayment,
    ]
  );

  const listData = useMemo(() => {
    const items = [{ type: "summary" }];
    if ((creditBalance || 0) > 0) {
      items.push({ type: "credit", creditBalance: creditBalance || 0 });
    }
    return [...items, ...(payments || [])];
  }, [payments, creditBalance]);

  const keyExtractor = useCallback(
    (item, index) => {
      if (item.type === "summary") return "summary";
      if (item.type === "credit") return "credit";
      return item.id;
    },
    []
  );

  const renderItem = useCallback(
    ({ item }) => {
      if (item.type === "summary") {
        return renderSummaryCard;
      }
      if (item.type === "credit") {
        return <CreditBalance creditBalance={item.creditBalance} />;
      }
      return renderPaymentItem({ item });
    },
    [renderSummaryCard, renderPaymentItem]
  );

  if (settingsLoading || loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.white,
              borderBottomColor: colors.gray200,
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
              <Text style={styles.headerIconText}>💰</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.title, { color: colors.primary }]}>
                Jimpitan Warga
              </Text>
              {userProfile && (
                <Text style={[styles.subtitle, { color: colors.gray600 }]}>
                  {userProfile.namaWarga}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.gray600 }]}>
            Memuat data pembayaran...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.white, borderBottomColor: colors.gray200 },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={[styles.headerIcon, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
            <Text style={styles.headerIconText}>💰</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.title, { color: colors.primary }]}>
              Jimpitan Warga
            </Text>
            {userProfile && (
              <Text style={[styles.subtitle, { color: colors.gray600 }]}>
                {userProfile.namaWarga}
              </Text>
            )}
            {timeline && (
              <Text style={[styles.timelineInfo, { color: colors.primaryLight }]}>
                {timeline.name}
              </Text>
            )}
          </View>
        </View>
      </View>

      {payments.length > 0 ? (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              title="Memuat ulang..."
              titleColor={colors.gray600}
            />
          }
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: index === 0 ? 250 : 180,
            offset: index === 0 ? 0 : 250 + (index - 1) * 180,
            index,
          })}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyIcon, { color: colors.gray400 }]}>📊</Text>
          <Text style={[styles.emptyText, { color: colors.gray600 }]}>
            {timeline
              ? "Belum ada data pembayaran"
              : "Belum ada timeline aktif"}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.gray500 }]}>
            {timeline
              ? "Data pembayaran akan muncul setelah admin membuat timeline"
              : "Admin belum membuat timeline pembayaran"}
          </Text>
        </View>
      )}

      <PaymentModal
        visible={paymentModalVisible}
        payment={selectedPayment}
        creditBalance={creditBalance}
        userProfile={userProfile}
        onClose={() => setPaymentModalVisible(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {updatingPayment && (
        <View
          style={[
            styles.updateOverlay,
            { backgroundColor: "rgba(0, 0, 0, 0.7)" },
          ]}
        >
          <View style={[styles.updateModal, { backgroundColor: colors.white }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.updateText, { color: colors.gray900 }]}>
              Memperbarui status pembayaran...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: lightTheme.accent,
  },
  headerIconText: {
    fontSize: 28,
    color: "white",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  timelineInfo: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  listContent: {
    padding: 24,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  summaryStats: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  amountSummary: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  paymentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  modernHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  periodBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  periodBadgeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  periodCardContent: {
    flex: 1,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  amountDisplay: {
    fontSize: 14,
    fontWeight: "700",
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  periodInfo: {
    flex: 1,
  },
  periodText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  periodNumber: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusIcon: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  infoChip: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 80,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 2,
  },
  chipValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  compactPayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 8,
  },
  payButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  payButtonIcon: {
    fontSize: 16,
  },
  payButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  valueText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1.5,
    textAlign: "right",
  },
  payButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  updateOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  updateModal: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    minWidth: 200,
  },
  updateText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
});

export default StatusPembayaran;
