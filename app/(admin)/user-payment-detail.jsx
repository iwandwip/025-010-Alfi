import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSettings } from "../../contexts/SettingsContext";
import { getColors } from "../../constants/Colors";
import { formatDate, toISOString } from "../../utils/dateUtils";
import {
  getUserDetailedPayments,
  updateUserPaymentStatus,
} from "../../services/adminPaymentService";
import Button from "../../components/ui/Button";

function UserPaymentDetail() {
  const { theme, loading: settingsLoading } = useSettings();
  const colors = getColors(theme);
  const router = useRouter();
  const { userId, userName, timelineId } = useLocalSearchParams();

  const [payments, setPayments] = useState([]);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const loadData = useCallback(
    async (isRefresh = false) => {
      try {
        if (!isRefresh) setLoading(true);

        const result = await getUserDetailedPayments(userId);

        if (result.success) {
          setPayments(result.payments);
          setTimeline(result.timeline);
        } else {
          setPayments([]);
          setTimeline(null);
        }
      } catch (error) {
        console.error("Error loading user payment detail:", error);
        setPayments([]);
        setTimeline(null);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (!settingsLoading) {
      loadData();
    }
  }, [loadData, settingsLoading]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  }, [loadData]);

  const summary = useMemo(() => {
    if (!payments.length) return null;

    const total = payments.length;
    const lunas = payments.filter((p) => p.status === "lunas").length;
    const belumBayar = payments.filter(
      (p) => p.status === "belum_bayar"
    ).length;
    const terlambat = payments.filter((p) => p.status === "terlambat").length;

    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paidAmount = payments
      .filter((p) => p.status === "lunas")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const unpaidAmount = totalAmount - paidAmount;

    const progressPercentage =
      total > 0 ? Math.round((lunas / total) * 100) : 0;

    return {
      total,
      lunas,
      belumBayar,
      terlambat,
      totalAmount,
      paidAmount,
      unpaidAmount,
      progressPercentage,
    };
  }, [payments]);

  const handlePaymentPress = useCallback((payment) => {
    setSelectedPayment(payment);
    setActionModalVisible(true);
  }, []);

  const handleUpdatePaymentStatus = useCallback(
    async (newStatus, notes = "") => {
      if (!selectedPayment || !timeline) return;

      setUpdatingPayment(true);

      const updateData = {
        status: newStatus,
        updatedAt: new Date(),
      };

      if (newStatus === "lunas") {
        updateData.paymentDate = toISOString();
        updateData.paymentMethod = "tunai";
        updateData.notes = notes || "Pembayaran dikonfirmasi oleh admin";
      }

      if (notes) {
        updateData.notes = notes;
      }

      try {
        const result = await updateUserPaymentStatus(
          timeline.id,
          selectedPayment.periodKey,
          userId,
          updateData
        );

        if (result.success) {
          await loadData(true);
          Alert.alert(
            "Berhasil!",
            `Status pembayaran ${
              selectedPayment.periodData?.label
            } berhasil diperbarui menjadi ${
              newStatus === "lunas"
                ? "Lunas"
                : newStatus === "belum_bayar"
                ? "Belum Bayar"
                : "Terlambat"
            }.`,
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "Error",
            "Gagal memperbarui status pembayaran: " + result.error
          );
        }
      } catch (error) {
        Alert.alert("Error", "Terjadi kesalahan saat memperbarui pembayaran");
        console.error("Error updating payment:", error);
      }

      setUpdatingPayment(false);
      setActionModalVisible(false);
      setSelectedPayment(null);
    },
    [selectedPayment, timeline, userId, loadData]
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

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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
          Ringkasan Pembayaran - {userName}
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, { color: colors.gray700 }]}>
              Progress: {summary.lunas}/{summary.total} periode
            </Text>
            <Text
              style={[styles.progressPercentage, { color: colors.primary }]}
            >
              {summary.progressPercentage}%
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
                  width: `${summary.progressPercentage}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>
                {summary.lunas}
              </Text>
              <Text style={[styles.statLabel, { color: colors.gray600 }]}>
                Lunas
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.error }]}>
                {summary.belumBayar}
              </Text>
              <Text style={[styles.statLabel, { color: colors.gray600 }]}>
                Belum Bayar
              </Text>
            </View>

            {summary.terlambat > 0 && (
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.warning }]}>
                  {summary.terlambat}
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
                {formatCurrency(summary.totalAmount)}
              </Text>
            </View>

            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: colors.gray600 }]}>
                Sudah Dibayar:
              </Text>
              <Text style={[styles.amountValue, { color: colors.success }]}>
                {formatCurrency(summary.paidAmount)}
              </Text>
            </View>

            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: colors.gray600 }]}>
                Belum Dibayar:
              </Text>
              <Text style={[styles.amountValue, { color: colors.error }]}>
                {formatCurrency(summary.unpaidAmount)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }, [summary, colors, formatCurrency, userName]);

  const renderPaymentItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[
          styles.paymentCard,
          { backgroundColor: colors.white, borderColor: colors.gray200 },
        ]}
        onPress={() => handlePaymentPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.periodInfo}>
            <Text style={[styles.periodText, { color: colors.gray900 }]}>
              {item.periodData.label}
            </Text>
            <Text style={[styles.periodNumber, { color: colors.gray500 }]}>
              Periode {item.periodData.number}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + "15" },
            ]}
          >
            <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Text style={[styles.labelText, { color: colors.gray600 }]}>
              Nominal:
            </Text>
            <Text style={[styles.valueText, { color: colors.gray900 }]}>
              {formatCurrency(item.amount)}
            </Text>
          </View>

          {item.paymentDate && (
            <View style={styles.infoRow}>
              <Text style={[styles.labelText, { color: colors.gray600 }]}>
                Tanggal Bayar:
              </Text>
              <Text style={[styles.valueText, { color: colors.gray900 }]}>
                {formatDate(item.paymentDate)}
              </Text>
            </View>
          )}

          {item.paymentMethod && (
            <View style={styles.infoRow}>
              <Text style={[styles.labelText, { color: colors.gray600 }]}>
                Metode:
              </Text>
              <Text style={[styles.valueText, { color: colors.gray900 }]}>
                {item.paymentMethod === "tunai" ? "Tunai" : "Online"}
              </Text>
            </View>
          )}

          {item.notes && (
            <View style={styles.infoRow}>
              <Text style={[styles.labelText, { color: colors.gray600 }]}>
                Catatan:
              </Text>
              <Text style={[styles.valueText, { color: colors.gray700 }]}>
                {item.notes}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.tapHint, { color: colors.gray500 }]}>
            Ketuk untuk ubah status
          </Text>
          <Text style={[styles.arrowText, { color: colors.gray400 }]}>→</Text>
        </View>
      </TouchableOpacity>
    ),
    [
      colors,
      getStatusColor,
      getStatusIcon,
      getStatusLabel,
      formatCurrency,
      formatDate,
      handlePaymentPress,
    ]
  );

  const listData = useMemo(() => {
    return [{ type: "summary" }, ...payments];
  }, [payments]);

  const keyExtractor = useCallback(
    (item, index) => (item.type === "summary" ? "summary" : item.id),
    []
  );

  const renderItem = useCallback(
    ({ item }) => {
      if (item.type === "summary") {
        return renderSummaryCard;
      }
      return renderPaymentItem({ item });
    },
    [renderSummaryCard, renderPaymentItem]
  );

  const renderActionModal = useCallback(
    () => (
      <Modal
        visible={actionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !updatingPayment && setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: colors.white }]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: colors.gray200 },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.gray900 }]}>
                Ubah Status Pembayaran
              </Text>
              {!updatingPayment && (
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    { backgroundColor: colors.gray100 },
                  ]}
                  onPress={() => setActionModalVisible(false)}
                >
                  <Text
                    style={[styles.closeButtonText, { color: colors.gray600 }]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedPayment && (
                <View
                  style={[
                    styles.paymentInfo,
                    { backgroundColor: colors.primary + "10" },
                  ]}
                >
                  <Text
                    style={[styles.paymentTitle, { color: colors.gray900 }]}
                  >
                    {selectedPayment.periodData?.label}
                  </Text>
                  <Text
                    style={[styles.paymentAmount, { color: colors.primary }]}
                  >
                    {formatCurrency(selectedPayment.amount)}
                  </Text>
                  <Text
                    style={[styles.currentStatus, { color: colors.gray600 }]}
                  >
                    Status saat ini: {getStatusLabel(selectedPayment.status)}
                  </Text>
                </View>
              )}

              {updatingPayment ? (
                <View style={styles.loadingSection}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.gray900 }]}>
                    Memperbarui status pembayaran...
                  </Text>
                </View>
              ) : (
                <View style={styles.actionButtons}>
                  <Button
                    title="✅ Tandai Lunas"
                    onPress={() => handleUpdatePaymentStatus("lunas")}
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.success },
                    ]}
                  />

                  <Button
                    title="❌ Tandai Belum Bayar"
                    onPress={() => handleUpdatePaymentStatus("belum_bayar")}
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.error },
                    ]}
                  />

                  <Button
                    title="⚠️ Tandai Terlambat"
                    onPress={() => handleUpdatePaymentStatus("terlambat")}
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.warning },
                    ]}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    ),
    [
      actionModalVisible,
      updatingPayment,
      selectedPayment,
      colors,
      formatCurrency,
      getStatusLabel,
      handleUpdatePaymentStatus,
    ]
  );

  if (settingsLoading || loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              ← Kembali
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.gray900 }]}>
            Detail Pembayaran
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.gray600 }]}>
            Memuat detail pembayaran...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.white, borderBottomColor: colors.gray200 },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            ← Kembali
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.gray900 }]}>
          Detail Pembayaran
        </Text>
        <Text style={[styles.subtitle, { color: colors.gray700 }]}>
          {userName}
        </Text>
        {timeline && (
          <Text style={[styles.timelineInfo, { color: colors.primary }]}>
            Timeline: {timeline.name}
          </Text>
        )}
      </View>

      {payments.length > 0 ? (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
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
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyIcon, { color: colors.gray400 }]}>📊</Text>
          <Text style={[styles.emptyText, { color: colors.gray600 }]}>
            Belum ada data pembayaran
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.gray500 }]}>
            Data pembayaran akan muncul setelah timeline dibuat
          </Text>
        </View>
      )}

      {renderActionModal()}
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
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
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
    borderTopColor: "#e5e7eb",
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
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  tapHint: {
    fontSize: 12,
    fontStyle: "italic",
  },
  arrowText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    paddingHorizontal: 24,
  },
  paymentInfo: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 20,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  currentStatus: {
    fontSize: 14,
  },
  actionButtons: {
    paddingBottom: 30,
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
  loadingSection: {
    alignItems: "center",
    paddingVertical: 40,
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
});

export default UserPaymentDetail;
