import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  FlatList,
  Pressable,
  Badge,
  Icon,
  Progress,
  Center,
  Spinner,
  Modal,
  useToast,
} from "native-base";
import { RefreshControl, AppState } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useNotification } from "../../contexts/NotificationContext";
import { getColors } from "../../constants/Colors";
import NBCard, { NBInfoCard } from "../../components/ui/NBCard";
import NBButton from "../../components/ui/NBButton";
import NBLoadingSpinner from "../../components/ui/NBLoadingSpinner";
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

function StatusSetoran() {
  const { userProfile } = useAuth();
  const { theme, loading: settingsLoading } = useSettings();
  const { 
    showPaymentSuccessNotification, 
    showErrorNotification,
    showPaymentWithCreditNotification,
    showCreditBalanceNotification
  } = useNotification();
  const colors = getColors(theme);
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
  }, [loadData, settingsLoading]); // loadData changes when userProfile.id changes

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
        // Determine payment amount
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
      <NBCard
        title="Ringkasan Setoran"
        icon="assessment"
        variant="elevated"
        shadow={3}
        bg={colors.white}
      >
        <VStack space={4}>
          <VStack space={2}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="sm" color={colors.gray700}>
                Progress: {summary.lunas || 0}/{summary.total || 0} periode
              </Text>
              <Text fontSize="md" fontWeight="bold" color="teal.600">
                {summary.progressPercentage || 0}%
              </Text>
            </HStack>
            <Progress
              value={summary.progressPercentage || 0}
              colorScheme="teal"
              bg={colors.gray200}
              size="sm"
            />
          </VStack>

          <HStack justifyContent="space-around">
            <VStack alignItems="center">
              <Heading size="lg" color={colors.success}>
                {summary.lunas || 0}
              </Heading>
              <Text fontSize="xs" color={colors.gray600}>
                Lunas
              </Text>
            </VStack>

            <VStack alignItems="center">
              <Heading size="lg" color={colors.error}>
                {summary.belumBayar || 0}
              </Heading>
              <Text fontSize="xs" color={colors.gray600}>
                Belum Bayar
              </Text>
            </VStack>

            {(summary.terlambat || 0) > 0 && (
              <VStack alignItems="center">
                <Heading size="lg" color={colors.warning}>
                  {summary.terlambat || 0}
                </Heading>
                <Text fontSize="xs" color={colors.gray600}>
                  Terlambat
                </Text>
              </VStack>
            )}
          </HStack>

          <VStack space={2} borderTopWidth={1} borderTopColor={colors.gray200} pt={3}>
            <HStack justifyContent="space-between">
              <Text fontSize="sm" color={colors.gray600}>
                Total Tagihan:
              </Text>
              <Text fontSize="sm" fontWeight="bold" color={colors.gray900}>
                {formatCurrency(summary.totalAmount || 0)}
              </Text>
            </HStack>

            <HStack justifyContent="space-between">
              <Text fontSize="sm" color={colors.gray600}>
                Sudah Disetor:
              </Text>
              <Text fontSize="sm" fontWeight="bold" color={colors.success}>
                {formatCurrency(summary.paidAmount || 0)}
              </Text>
            </HStack>

            <HStack justifyContent="space-between">
              <Text fontSize="sm" color={colors.gray600}>
                Belum Disetor:
              </Text>
              <Text fontSize="sm" fontWeight="bold" color={colors.error}>
                {formatCurrency(summary.unpaidAmount || 0)}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </NBCard>
    );
  }, [summary, colors, formatCurrency]);

  const renderPaymentItem = useCallback(
    ({ item }) => {
      const statusColorScheme = item.status === "lunas" ? "success" : 
                               item.status === "belum_bayar" ? "error" : "warning";
      
      return (
        <NBCard
          variant="outline"
          borderColor={colors.gray200}
          bg={colors.white}
          mb={3}
        >
          <VStack space={3}>
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack flex={1}>
                <Text fontSize="md" fontWeight="600" color={colors.gray900}>
                  {item.periodData.label}
                </Text>
                <Text fontSize="sm" color={colors.gray500}>
                  Periode {item.periodData.number}
                </Text>
              </VStack>

              <Badge
                colorScheme={statusColorScheme}
                variant="subtle"
                borderRadius="full"
                px={3}
                py={1}
              >
                <HStack alignItems="center" space={1}>
                  <Text fontSize="sm">{getStatusIcon(item.status)}</Text>
                  <Text fontSize="sm">{getStatusLabel(item.status)}</Text>
                </HStack>
              </Badge>
            </HStack>

            <VStack space={2}>
              <HStack justifyContent="space-between">
                <Text fontSize="sm" color={colors.gray600}>
                  Nominal:
                </Text>
                <Text fontSize="sm" fontWeight="bold" color={colors.gray900}>
                  {formatCurrency(item.amount || 0)}
                </Text>
              </HStack>

              {(item.creditApplied || 0) > 0 && (
                <HStack justifyContent="space-between">
                  <HStack alignItems="center" space={1}>
                    <Icon as={MaterialIcons} name="account-balance-wallet" size={4} color="teal.600" />
                    <Text fontSize="sm" color="teal.600">
                      Credit Applied:
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="bold" color="teal.600">
                    -{formatCurrency(item.creditApplied || 0)}
                  </Text>
                </HStack>
              )}

              {(item.remainingAmount || 0) > 0 && (item.remainingAmount || 0) < (item.amount || 0) && (
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="teal.600">
                    Sisa Bayar:
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="teal.600">
                    {formatCurrency(item.remainingAmount || 0)}
                  </Text>
                </HStack>
              )}

              {item.paymentDate && (
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={colors.gray600}>
                    Tanggal Bayar:
                  </Text>
                  <Text fontSize="sm" color={colors.gray900}>
                    {formatDate(item.paymentDate)}
                  </Text>
                </HStack>
              )}

              {item.paymentMethod && (
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={colors.gray600}>
                    Metode:
                  </Text>
                  <Text fontSize="sm" color={colors.gray900}>
                    {item.paymentMethod === "tunai" ? "Tunai" : "Online"}
                  </Text>
                </HStack>
              )}

              {item.notes && (
                <VStack>
                  <Text fontSize="sm" color={colors.gray600}>
                    Catatan:
                  </Text>
                  <Text fontSize="sm" color={colors.gray700}>
                    {item.notes}
                  </Text>
                </VStack>
              )}
            </VStack>

            {item.status === "belum_bayar" && (
              <NBButton
                title="Bayar Sekarang"
                onPress={() => handlePayNow(item)}
                disabled={updatingPayment}
                variant="primary"
                size="md"
                leftIcon={<Icon as={MaterialIcons} name="payment" size={5} color="white" />}
              />
            )}

            {item.status === "terlambat" && (
              <NBButton
                title="Bayar Segera"
                onPress={() => handlePayNow(item)}
                disabled={updatingPayment}
                variant="primary"
                style={{ backgroundColor: colors.warning }}
                size="md"
                leftIcon={<Icon as={MaterialIcons} name="flash-on" size={5} color="white" />}
              />
            )}
          </VStack>
        </NBCard>
      );
    },
    [
      colors,
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
      <Box flex={1} bg={colors.background} safeAreaTop>
        <VStack
          px={6}
          py={5}
          bg={colors.white}
          borderBottomWidth={1}
          borderBottomColor={colors.gray200}
          shadow={2}
        >
          <Heading size="md" textAlign="center" color={colors.gray900}>
            Status Setoran Jimpitan
          </Heading>
          {userProfile && (
            <Text fontSize="sm" textAlign="center" color={colors.gray600} mt={1}>
              Warga: {userProfile.namaWarga}
            </Text>
          )}
        </VStack>

        <NBLoadingSpinner text="Memuat data pembayaran..." />
      </Box>
    );
  }

  return (
    <Box flex={1} bg={colors.background} safeAreaTop>
      <VStack
        px={6}
        py={5}
        bg={colors.white}
        borderBottomWidth={1}
        borderBottomColor={colors.gray200}
        shadow={2}
      >
        <Heading size="md" textAlign="center" color={colors.gray900}>
          Status Setoran Jimpitan
        </Heading>
        {userProfile && (
          <Text fontSize="sm" textAlign="center" color={colors.gray600} mt={1}>
            Warga: {userProfile.namaWarga}
          </Text>
        )}
        {timeline && (
          <Text fontSize="xs" textAlign="center" color="teal.600" mt={1} fontWeight="500">
            Timeline: {timeline.name}
          </Text>
        )}
      </VStack>

      {payments.length > 0 ? (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{
            padding: 24,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#14b8a6"]}
              tintColor="#14b8a6"
              title="Memuat ulang..."
              titleColor={colors.gray600}
            />
          }
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
        />
      ) : (
        <Center flex={1} px={6}>
          <VStack alignItems="center" space={3}>
            <Icon as={MaterialIcons} name="assessment" size={16} color={colors.gray400} />
            <Heading size="md" color={colors.gray600} textAlign="center">
              {timeline
                ? "Belum ada data pembayaran"
                : "Belum ada timeline aktif"}
            </Heading>
            <Text fontSize="sm" color={colors.gray500} textAlign="center">
              {timeline
                ? "Data pembayaran akan muncul setelah admin membuat timeline"
                : "Admin belum membuat timeline pembayaran"}
            </Text>
          </VStack>
        </Center>
      )}

      <PaymentModal
        visible={paymentModalVisible}
        payment={selectedPayment}
        creditBalance={creditBalance}
        onClose={() => setPaymentModalVisible(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <Modal isOpen={updatingPayment} size="lg">
        <Modal.Content maxWidth="400px">
          <Modal.Body>
            <Center py={6}>
              <VStack space={4} alignItems="center">
                <Spinner size="lg" color="teal.600" />
                <Text fontSize="md" color={colors.gray900}>
                  Memperbarui status pembayaran...
                </Text>
              </VStack>
            </Center>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </Box>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  timelineInfo: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
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
};

export default StatusSetoran;
