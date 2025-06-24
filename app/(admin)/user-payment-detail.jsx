import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from '@expo/vector-icons';
import { useSettings } from "../../contexts/SettingsContext";
import { Shadows } from "../../constants/theme";
import { useRoleTheme } from "../../hooks/useRoleTheme";
import { formatDate, toISOString } from "../../utils/dateUtils";
import {
  getUserDetailedPayments,
  updateUserPaymentStatus,
} from "../../services/adminPaymentService";
import { processCustomPaymentWithAutoAllocation } from "../../services/wargaPaymentService";

function UserPaymentDetail() {
  const { colors } = useRoleTheme();
  const { theme, loading: settingsLoading } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId, userName, timelineId } = useLocalSearchParams();

  const [payments, setPayments] = useState([]);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [customPaymentModalVisible, setCustomPaymentModalVisible] = useState(false);
  const [customPaymentAmount, setCustomPaymentAmount] = useState('');

  const loadData = useCallback(
    async (isRefresh = false) => {
      try {
        if (!isRefresh) setLoading(true);

        const result = await getUserDetailedPayments(userId);

        if (result.success) {
          setPayments(result.payments || []);
          setTimeline(result.timeline || null);
        } else {
          console.error("Error loading payments:", result.error);
          Alert.alert("Error", "Gagal memuat data pembayaran: " + (result.error || 'Unknown error'));
          setPayments([]);
          setTimeline(null);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        Alert.alert("Error", "Terjadi kesalahan saat memuat data: " + error.message);
        setPayments([]);
        setTimeline(null);
      } finally {
        if (!isRefresh) setLoading(false);
      }
    },
    [userId]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, loadData]);

  const summary = useMemo(() => {
    if (!payments.length) return null;

    const totalPayments = payments.length;
    const paidCount = payments.filter((p) => p.status === "lunas").length;
    const partialCount = payments.filter((p) => p.status === "belum_lunas").length;
    const unpaidCount = payments.filter((p) => p.status === "belum_bayar" || p.status === "terlambat").length;

    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paidAmount = payments.filter((p) => p.status === "lunas").reduce((sum, p) => sum + (p.amount || 0), 0);
    const partialAmount = payments.filter((p) => p.status === "belum_lunas").reduce((sum, p) => sum + (p.totalPaid || 0), 0);
    const unpaidAmount = totalAmount - paidAmount - partialAmount;

    const progressPercentage = totalAmount > 0 ? Math.round(((paidAmount + partialAmount) / totalAmount) * 100) : 0;

    return {
      totalPayments,
      paidCount,
      partialCount,
      unpaidCount,
      totalAmount,
      paidAmount,
      partialAmount,
      unpaidAmount,
      progressPercentage,
    };
  }, [payments]);

  const formatCurrency = useCallback((amount) => {
    if (!amount || isNaN(amount)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  const handlePaymentPress = useCallback((payment) => {
    setSelectedPayment(payment);
    setActionModalVisible(true);
  }, []);

  const getStatusLabel = useCallback((status) => {
    switch (status) {
      case "lunas":
        return "Lunas";
      case "belum_bayar":
        return "Belum Bayar";
      case "belum_lunas":
        return "Belum Lunas";
      case "terlambat":
        return "Terlambat";
      default:
        return "Unknown";
    }
  }, []);

  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!selectedPayment) return;

      setUpdatingPayment(true);
      setActionModalVisible(false);

      try {
        if (!timeline) {
          Alert.alert("Error", "Timeline tidak ditemukan");
          return;
        }

        const updateData = {
          status: newStatus,
          paymentMethod: newStatus === "lunas" ? "admin_update" : null,
          paymentDate: newStatus === "lunas" ? new Date() : null
        };

        const result = await updateUserPaymentStatus(
          timeline.id,
          selectedPayment.periodKey,
          selectedPayment.wargaId,
          updateData
        );

        if (result.success) {
          await loadData(true);
          Alert.alert("Berhasil", `Status pembayaran berhasil diubah menjadi "${getStatusLabel(newStatus)}"`);
        } else {
          Alert.alert("Error", "Gagal mengubah status pembayaran: " + result.error);
        }
      } catch (error) {
        Alert.alert("Error", "Terjadi kesalahan saat mengubah status");
        console.error("Error updating payment:", error);
      }

      setUpdatingPayment(false);
      setSelectedPayment(null);
    },
    [selectedPayment, loadData, getStatusLabel, timeline]
  );

  const handleCustomPayment = useCallback(async () => {
    const amount = parseFloat(customPaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Masukkan jumlah pembayaran yang valid");
      return;
    }

    setUpdatingPayment(true);

    try {
      const result = await processCustomPaymentWithAutoAllocation(
        userId,
        amount,
        "admin_custom",
        `Custom payment oleh admin untuk ${userName || 'warga'}`
      );
      
      if (result.success) {
        await loadData(true);
        
        let message = `Berhasil memproses pembayaran sebesar ${formatCurrency(amount)}.\n\n`;
        message += `Total diproses: ${formatCurrency(result.totalProcessed)}\n`;
        message += `Sisa saldo credit: ${formatCurrency(result.newCreditBalance)}\n\n`;
        
        if (result.processedPayments && result.processedPayments.length > 0) {
          message += "Pembayaran yang diproses:\n";
          result.processedPayments.forEach(payment => {
            message += `• ${payment.periodLabel}: ${payment.status} ${payment.isPartial ? '(Parsial)' : ''}\n`;
          });
        }
        
        if (result.remainingAmount > 0) {
          message += `\nSisa ${formatCurrency(result.remainingAmount)} tidak dapat diproses (melebihi batas credit maksimal).`;
        }

        Alert.alert("Pembayaran Berhasil! 🎉", message, [{ text: "OK" }]);
        
        setCustomPaymentAmount('');
        setCustomPaymentModalVisible(false);
      } else {
        Alert.alert("Error", "Gagal memproses pembayaran: " + result.error);
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan saat memproses pembayaran");
      console.error("Error processing payment:", error);
    }

    setUpdatingPayment(false);
  }, [customPaymentAmount, userId, loadData, userName, formatCurrency]);

  const getStatusColor = useCallback(
    (status) => {
      switch (status) {
        case "lunas":
          return colors.success;
        case "belum_bayar":
          return colors.error;
        case "belum_lunas":
          return colors.warning;
        case "terlambat":
          return colors.error;
        default:
          return colors.onSurfaceVariant;
      }
    },
    [colors]
  );

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case "lunas":
        return "check-circle";
      case "belum_bayar":
        return "cancel";
      case "belum_lunas":
        return "schedule";
      case "terlambat":
        return "warning";
      default:
        return "help";
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={[colors.primaryContainer, colors.background]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
            Detail Pembayaran
          </Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.onSurface }]}>
            Memuat data pembayaran...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const renderSummaryCard = () => {
    if (!summary) return null;

    return (
      <View style={styles.summarySection}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Ringkasan Pembayaran</Text>

        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardContent}>
            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: colors.onSurfaceVariant }]}>
                  Progress Pembayaran
                </Text>
                <Text style={[styles.progressValue, { color: colors.primary }]}>
                  {summary.progressPercentage}%
                </Text>
              </View>
              <View style={[styles.progressBarContainer, { backgroundColor: colors.surfaceVariant }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${summary.progressPercentage}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Stats Section */}
            <View style={styles.statsSection}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.success }]}>
                    {summary.paidCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                    Lunas
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.warning }]}>
                    {summary.partialCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                    Parsial
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.error }]}>
                    {summary.unpaidCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                    Belum
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.outline }]} />

            {/* Amount Summary */}
            <View style={styles.amountSection}>
              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: colors.onSurfaceVariant }]}>
                  Total Tagihan
                </Text>
                <Text style={[styles.amountValue, { color: colors.onSurface }]}>
                  {formatCurrency(summary.totalAmount)}
                </Text>
              </View>

              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: colors.onSurfaceVariant }]}>
                  Sudah Dibayar
                </Text>
                <Text style={[styles.amountValue, { color: colors.success }]}>
                  {formatCurrency(summary.paidAmount)}
                </Text>
              </View>

              {summary.partialAmount > 0 && (
                <View style={styles.amountRow}>
                  <Text style={[styles.amountLabel, { color: colors.onSurfaceVariant }]}>
                    Pembayaran Parsial
                  </Text>
                  <Text style={[styles.amountValue, { color: colors.warning }]}>
                    {formatCurrency(summary.partialAmount)}
                  </Text>
                </View>
              )}

              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: colors.onSurfaceVariant }]}>
                  Belum Dibayar
                </Text>
                <Text style={[styles.amountValue, { color: colors.error }]}>
                  {formatCurrency(summary.unpaidAmount)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPaymentItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.paymentCard, { backgroundColor: colors.surface }]}
      onPress={() => handlePaymentPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.periodInfo}>
          <Text style={[styles.periodText, { color: colors.onSurface }]}>
            {item.periodData?.label || `Periode ${item.period}`}
          </Text>
          <Text style={[styles.amountText, { color: colors.primary }]}>
            {formatCurrency(item.amount)}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <MaterialIcons 
            name={getStatusIcon(item.status)} 
            size={14} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        {item.paymentDate && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>
              Tanggal Bayar
            </Text>
            <Text style={[styles.detailValue, { color: colors.onSurface }]}>
              {formatDate(item.paymentDate)}
            </Text>
          </View>
        )}

        {item.paymentMethod && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>
              Metode
            </Text>
            <Text style={[styles.detailValue, { color: colors.onSurface }]}>
              {item.paymentMethod === "tunai" ? "Tunai" : "Online"}
            </Text>
          </View>
        )}

        {item.partialPayment && item.totalPaid > 0 && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>
              Terbayar
            </Text>
            <Text style={[styles.detailValue, { color: colors.warning, fontWeight: 'bold' }]}>
              {formatCurrency(item.totalPaid)}
            </Text>
          </View>
        )}

        {item.remainingAmount && item.remainingAmount > 0 && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>
              Sisa
            </Text>
            <Text style={[styles.detailValue, { color: colors.error, fontWeight: 'bold' }]}>
              {formatCurrency(item.remainingAmount)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.paymentFooter}>
        <Text style={[styles.tapHint, { color: colors.onSurfaceVariant }]}>
          Ketuk untuk ubah status
        </Text>
        <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
      </View>
    </TouchableOpacity>
  );

  // Main render
  return (
    <LinearGradient
      colors={[colors.primaryContainer, colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
          Detail Pembayaran
        </Text>
        <TouchableOpacity
          onPress={() => setCustomPaymentModalVisible(true)}
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
        >
          <MaterialIcons name="add" size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          {renderSummaryCard()}

          {/* Payment List */}
          <View style={styles.paymentSection}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Daftar Pembayaran ({userName || 'Warga'})
            </Text>

            {payments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="receipt-long" size={64} color={colors.onSurfaceVariant} />
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                  Tidak ada data pembayaran
                </Text>
              </View>
            ) : (
              payments.map((item, index) => (
                <View key={item.id || index}>
                  {renderPaymentItem({ item })}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action Modal */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.outline }]}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                Ubah Status Pembayaran
              </Text>
              <TouchableOpacity
                onPress={() => setActionModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {selectedPayment && (
                <>
                  <Text style={[styles.paymentInfo, { color: colors.onSurface }]}>
                    {selectedPayment.periodData?.label || `Periode ${selectedPayment.period}`}
                  </Text>
                  <Text style={[styles.paymentAmount, { color: colors.primary }]}>
                    {formatCurrency(selectedPayment.amount)}
                  </Text>

                  <View style={styles.statusOptions}>
                    <TouchableOpacity
                      style={[
                        styles.statusOption,
                        { borderColor: colors.success, backgroundColor: colors.successContainer }
                      ]}
                      onPress={() => handleStatusChange("lunas")}
                    >
                      <MaterialIcons name="check-circle" size={24} color={colors.success} />
                      <Text style={[styles.statusOptionText, { color: colors.success }]}>
                        Lunas
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.statusOption,
                        { borderColor: colors.error, backgroundColor: colors.errorContainer }
                      ]}
                      onPress={() => handleStatusChange("belum_bayar")}
                    >
                      <MaterialIcons name="cancel" size={24} color={colors.error} />
                      <Text style={[styles.statusOptionText, { color: colors.error }]}>
                        Belum Bayar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.statusOption,
                        { borderColor: colors.warning, backgroundColor: colors.warningContainer }
                      ]}
                      onPress={() => handleStatusChange("belum_lunas")}
                    >
                      <MaterialIcons name="schedule" size={24} color={colors.warning} />
                      <Text style={[styles.statusOptionText, { color: colors.warning }]}>
                        Belum Lunas
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {updatingPayment && (
                <View style={styles.updatingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.updatingText, { color: colors.onSurface }]}>
                    Mengupdate status...
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Payment Modal */}
      <Modal
        visible={customPaymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCustomPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.outline }]}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                Pembayaran Custom
              </Text>
              <TouchableOpacity
                onPress={() => setCustomPaymentModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.onSurface }]}>
                  Jumlah Pembayaran
                </Text>
                <TextInput
                  style={[
                    styles.customAmountInput,
                    { 
                      borderColor: colors.outline,
                      backgroundColor: colors.surface,
                      color: colors.onSurface 
                    }
                  ]}
                  value={customPaymentAmount}
                  onChangeText={setCustomPaymentAmount}
                  keyboardType="numeric"
                  placeholder="Masukkan jumlah pembayaran"
                  placeholderTextColor={colors.onSurfaceVariant}
                />
                <Text style={[styles.helpText, { color: colors.onSurfaceVariant }]}>
                  Pembayaran akan dialokasikan otomatis ke periode yang belum lunas.
                </Text>
              </View>

              {updatingPayment && (
                <View style={styles.processingSection}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.processingText, { color: colors.onSurface }]}>
                    Memproses pembayaran...
                  </Text>
                </View>
              )}
            </View>

            <View style={[styles.modalFooter, { borderTopColor: colors.outline }]}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { 
                    borderColor: colors.outline,
                    backgroundColor: colors.surface 
                  }
                ]}
                onPress={() => setCustomPaymentModalVisible(false)}
                disabled={updatingPayment}
              >
                <Text style={[styles.cancelButtonText, { color: colors.onSurface }]}>
                  Batal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: colors.primary }
                ]}
                onPress={handleCustomPayment}
                disabled={updatingPayment || !customPaymentAmount.trim()}
              >
                <Text style={[styles.confirmButtonText, { color: colors.onPrimary }]}>
                  {updatingPayment ? "Memproses..." : "Proses"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    ...Shadows.sm,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
  },
  placeholder: {
    width: 40,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },

  // Summary Section
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryCard: {
    borderRadius: 16,
    ...Shadows.sm,
  },
  cardContent: {
    padding: 20,
  },

  // Progress Section
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Stats Section
  statsSection: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  divider: {
    height: 1,
    marginVertical: 4,
  },

  // Amount Section
  amountSection: {
    marginTop: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },

  // Payment Section
  paymentSection: {
    marginBottom: 24,
  },
  paymentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Shadows.sm,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  periodInfo: {
    flex: 1,
    marginRight: 12,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tapHint: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalContent: {
    padding: 20,
  },
  paymentInfo: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  statusOptions: {
    gap: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  updatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  updatingText: {
    fontSize: 16,
  },

  // Custom Payment Modal
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  customAmountInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
  processingSection: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserPaymentDetail;