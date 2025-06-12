import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../components/ui/Button";
import TimelinePicker from "../../components/ui/TimelinePicker";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  getActiveTimeline,
  getTimelineTemplates,
  resetTimelinePayments,
  deleteActiveTimeline,
  updateTimelineSimulationDate,
} from "../../services/timelineService";
import { bulkUpdatePaymentStatus } from "../../services/adminPaymentService";

export default function TimelineManager() {
  const [activeTimeline, setActiveTimeline] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [simulationDateTime, setSimulationDateTime] = useState(
    new Date().toISOString()
  );
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    const [timelineResult, templatesResult] = await Promise.all([
      getActiveTimeline(),
      getTimelineTemplates(),
    ]);

    if (timelineResult.success) {
      setActiveTimeline(timelineResult.timeline);
      if (timelineResult.timeline.simulationDate) {
        setSimulationDateTime(timelineResult.timeline.simulationDate);
      }
    } else {
      setActiveTimeline(null);
    }

    if (templatesResult.success) {
      setTemplates(templatesResult.templates);
    }

    if (!isRefresh) setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateEndDate = (timeline) => {
    if (!timeline) return null;

    const start = new Date(timeline.startDate);
    const end = new Date(start);

    switch (timeline.type) {
      case "yearly":
        end.setFullYear(start.getFullYear() + timeline.duration);
        break;
      case "monthly":
        end.setMonth(start.getMonth() + timeline.duration);
        break;
      case "weekly":
        end.setDate(start.getDate() + timeline.duration * 7);
        break;
      case "daily":
        end.setDate(start.getDate() + timeline.duration);
        break;
      case "hourly":
        end.setHours(start.getHours() + timeline.duration);
        break;
      case "minute":
        end.setMinutes(start.getMinutes() + timeline.duration);
        break;
      default:
        end.setDate(start.getDate() + timeline.duration);
    }

    return end.toISOString();
  };

  const handleCreateTimeline = () => {
    router.push("/(admin)/create-timeline");
  };

  const handleManagePayments = () => {
    if (activeTimeline) {
      router.push({
        pathname: "/(admin)/payment-manager",
        params: { timelineId: activeTimeline.id },
      });
    }
  };

  const handleUpdateSimulationDateTime = async () => {
    if (!activeTimeline || activeTimeline.mode !== "manual") return;

    setUpdating(true);

    const result = await updateTimelineSimulationDate(simulationDateTime);

    if (result.success) {
      await loadData();
      Alert.alert("Berhasil", "Waktu simulasi berhasil diperbarui!");
    } else {
      Alert.alert("Error", result.error);
    }
    setUpdating(false);
  };

  const handleBulkUpdateStatus = async () => {
    if (!activeTimeline) return;

    Alert.alert(
      "Update Status Pembayaran",
      "Memperbarui status semua pembayaran berdasarkan timeline dan waktu saat ini. Lanjutkan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Update",
          onPress: async () => {
            setUpdating(true);
            const result = await bulkUpdatePaymentStatus();

            if (result.success) {
              Alert.alert(
                "Berhasil",
                `${result.updatedCount} pembayaran berhasil diperbarui!`
              );
            } else {
              Alert.alert("Error", result.error);
            }
            setUpdating(false);
          },
        },
      ]
    );
  };

  const handleResetPayments = () => {
    if (!activeTimeline) return;

    Alert.alert(
      "Reset Pembayaran",
      `Apakah Anda yakin ingin mereset semua data pembayaran untuk timeline "${activeTimeline.name}"?\n\nTindakan ini akan menghapus semua data pembayaran yang sudah ada.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Reset",
          style: "destructive",
          onPress: async () => {
            setResetting(true);
            const result = await resetTimelinePayments(activeTimeline.id);

            if (result.success) {
              Alert.alert("Berhasil", "Data pembayaran berhasil direset!");
            } else {
              Alert.alert("Error", result.error);
            }
            setResetting(false);
          },
        },
      ]
    );
  };

  const handleDeleteTimeline = () => {
    if (!activeTimeline) return;

    // First alert to confirm deletion with payment data options
    Alert.alert(
      "Hapus Timeline",
      `Apakah Anda yakin ingin menghapus timeline "${activeTimeline.name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Lanjutkan",
          onPress: () => showPaymentDataOptions()
        }
      ]
    );
  };

  const showPaymentDataOptions = () => {
    Alert.alert(
      "Opsi Data Pembayaran",
      "Pilih tindakan untuk data pembayaran santri:",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus Timeline Saja",
          onPress: () => confirmDeleteTimeline(false)
        },
        {
          text: "Hapus Timeline + Data Pembayaran",
          style: "destructive", 
          onPress: () => confirmDeleteTimeline(true)
        }
      ]
    );
  };

  const confirmDeleteTimeline = (deletePaymentData) => {
    const message = deletePaymentData 
      ? `Timeline "${activeTimeline.name}" dan SEMUA data pembayaran santri akan dihapus.\n\n⚠️ PERINGATAN: Semua riwayat pembayaran santri akan hilang permanen!`
      : `Timeline "${activeTimeline.name}" akan dihapus, tetapi data pembayaran santri akan dipertahankan untuk referensi.`;

    Alert.alert(
      "Konfirmasi Penghapusan",
      message + "\n\nTindakan ini TIDAK DAPAT dibatalkan!",
      [
        { text: "Batal", style: "cancel" },
        {
          text: deletePaymentData ? "Hapus Semua" : "Hapus Timeline",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            const result = await deleteActiveTimeline(deletePaymentData);

            if (result.success) {
              const successMessage = deletePaymentData
                ? "Timeline dan semua data pembayaran berhasil dihapus!"
                : "Timeline berhasil dihapus, data pembayaran santri dipertahankan.";
              
              Alert.alert(
                "Timeline Dihapus",
                successMessage,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      setActiveTimeline(null);
                      loadData();
                    },
                  },
                ]
              );
            } else {
              Alert.alert("Error", result.error);
            }
            setDeleting(false);
          },
        },
      ]
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeLabel = (type) => {
    const typeMap = {
      yearly: "Tahunan",
      monthly: "Bulanan",
      weekly: "Mingguan",
      daily: "Harian",
      hourly: "Jam-an",
      minute: "Menitan",
    };
    return typeMap[type] || "Custom";
  };

  const getActivePeriods = (timeline) => {
    if (!timeline || !timeline.periods) return 0;
    return Object.values(timeline.periods).filter((period) => period.active)
      .length;
  };

  const getTotalTimelineDuration = (timeline) => {
    if (!timeline) return "";

    const type = timeline.type;
    const duration = timeline.duration;

    switch (type) {
      case "yearly":
        return `${duration} tahun`;
      case "monthly":
        return `${duration} bulan`;
      case "weekly":
        return `${duration} minggu`;
      case "daily":
        return `${duration} hari`;
      case "hourly":
        return `${duration} jam`;
      case "minute":
        return `${duration} menit`;
      default:
        return `${duration} periode`;
    }
  };

  const formatSimulationDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Tidak diset";

    const date = new Date(dateTimeString);
    const type = activeTimeline?.type;

    switch (type) {
      case "yearly":
        return date.getFullYear().toString();
      case "monthly":
        return date.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });
      case "weekly":
        const weekNum = Math.ceil(date.getDate() / 7);
        return `Minggu ${weekNum}, ${date.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        })}`;
      case "daily":
        return date.toLocaleDateString("id-ID");
      case "hourly":
        return date.toLocaleString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      case "minute":
        return date.toLocaleString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      default:
        return date.toLocaleString("id-ID");
    }
  };

  const formatTimelineRange = (timeline) => {
    if (!timeline) return "Tidak diset";

    const startDate = new Date(timeline.startDate);
    const endDate = new Date(calculateEndDate(timeline));
    const type = timeline.type;

    const formatDate = (date) => {
      switch (type) {
        case "yearly":
          return date.getFullYear().toString();
        case "monthly":
          return date.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          });
        case "weekly":
          const weekNum = Math.ceil(date.getDate() / 7);
          return `Minggu ${weekNum}, ${date.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          })}`;
        case "daily":
          return date.toLocaleDateString("id-ID");
        case "hourly":
          return date.toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        case "minute":
          return date.toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        default:
          return date.toLocaleString("id-ID");
      }
    };

    return `${formatDate(startDate)} sampai ${formatDate(endDate)}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Timeline Manager</Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner text="Memuat data timeline..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Timeline Manager</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3b82f6"]}
            tintColor={"#3b82f6"}
            title="Memuat ulang..."
            titleColor={"#64748b"}
          />
        }
      >
        <View style={styles.activeTimelineSection}>
          <Text style={styles.sectionTitle}>Timeline Aktif</Text>

          {activeTimeline ? (
            <View style={styles.timelineCard}>
              <View style={styles.timelineHeader}>
                <Text style={styles.timelineName}>{activeTimeline.name}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>🟢 Aktif</Text>
                </View>
              </View>

              <View style={styles.timelineDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tipe:</Text>
                  <Text style={styles.detailValue}>
                    {getTypeLabel(activeTimeline.type)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Durasi:</Text>
                  <Text style={styles.detailValue}>
                    {getTotalTimelineDuration(activeTimeline)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Range Timeline:</Text>
                  <Text style={styles.detailValue}>
                    {formatTimelineRange(activeTimeline)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Periode Aktif:</Text>
                  <Text style={styles.detailValue}>
                    {getActivePeriods(activeTimeline)} periode
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Mode:</Text>
                  <Text style={styles.detailValue}>
                    {activeTimeline.mode === "manual"
                      ? "⚙️ Manual"
                      : "🕐 Real-time"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total Amount:</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(activeTimeline.totalAmount)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Per Periode:</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(activeTimeline.amountPerPeriod)}
                  </Text>
                </View>
              </View>

              {activeTimeline.mode === "manual" && (
                <View style={styles.simulationSection}>
                  <Text style={styles.simulationTitle}>
                    🕐 Kontrol Waktu Manual
                  </Text>

                  <View style={styles.currentSimulationInfo}>
                    <Text style={styles.currentSimulationLabel}>
                      Waktu Simulasi Saat Ini:
                    </Text>
                    <Text style={styles.currentSimulationValue}>
                      {formatSimulationDateTime(activeTimeline.simulationDate)}
                    </Text>
                  </View>

                  <TimelinePicker
                    label={`Atur Waktu Simulasi (${getTypeLabel(
                      activeTimeline.type
                    )})`}
                    value={simulationDateTime}
                    onChange={setSimulationDateTime}
                    timelineType={activeTimeline.type}
                    minDate={activeTimeline.startDate}
                    maxDate={calculateEndDate(activeTimeline)}
                    placeholder={`Pilih waktu simulasi dalam range timeline`}
                  />

                  <Button
                    title={
                      updating ? "Memperbarui..." : "Update Waktu Simulasi"
                    }
                    onPress={handleUpdateSimulationDateTime}
                    disabled={updating}
                    style={styles.updateDateButton}
                  />

                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      ℹ️ Mengubah waktu simulasi akan mempengaruhi perhitungan
                      status "terlambat" untuk semua pembayaran berdasarkan
                      timeline {getTypeLabel(activeTimeline.type).toLowerCase()}
                    </Text>
                  </View>

                  <View style={styles.rangeInfoBox}>
                    <Text style={styles.rangeInfoText}>
                      📅 Range simulasi yang diizinkan:{" "}
                      {formatTimelineRange(activeTimeline)}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.timelineActions}>
                <Button
                  title="Kelola Pembayaran"
                  onPress={handleManagePayments}
                  style={styles.manageButton}
                />

                <Button
                  title={
                    updating ? "Memperbarui..." : "🔄 Update Status Pembayaran"
                  }
                  onPress={handleBulkUpdateStatus}
                  disabled={updating}
                  style={styles.updateButton}
                />

                <View style={styles.dangerActions}>
                  <Button
                    title={resetting ? "Mereset..." : "Reset Pembayaran"}
                    onPress={handleResetPayments}
                    variant="outline"
                    style={styles.resetButton}
                    disabled={resetting || deleting}
                  />

                  <Button
                    title={deleting ? "Menghapus..." : "🗑️ Hapus Timeline"}
                    onPress={handleDeleteTimeline}
                    variant="outline"
                    style={styles.deleteButton}
                    disabled={resetting || deleting}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noTimelineCard}>
              <Text style={styles.noTimelineIcon}>📅</Text>
              <Text style={styles.noTimelineText}>
                Belum ada timeline aktif
              </Text>
              <Text style={styles.noTimelineDesc}>
                Buat timeline baru untuk mulai mengelola pembayaran bisyaroh
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <Button
            title={
              activeTimeline ? "Buat Timeline Baru" : "Buat Timeline Pertama"
            }
            onPress={handleCreateTimeline}
            style={styles.createButton}
          />

          {activeTimeline && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Membuat timeline baru akan mengganti timeline aktif saat ini
              </Text>
            </View>
          )}
        </View>

        <View style={styles.templatesSection}>
          <Text style={styles.sectionTitle}>Template Tersimpan</Text>

          {templates.length > 0 ? (
            templates.map((template) => (
              <View key={template.id} style={styles.templateCard}>
                <View style={styles.templateHeader}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateDate}>
                    {new Date(template.createdAt?.toDate()).toLocaleDateString(
                      "id-ID"
                    )}
                  </Text>
                </View>

                <View style={styles.templateDetails}>
                  <Text style={styles.templateType}>
                    {getTypeLabel(template.type)} - {template.duration} periode
                  </Text>
                  <Text style={styles.templateAmount}>
                    Base: {formatCurrency(template.baseAmount)}
                  </Text>
                  {template.holidays && template.holidays.length > 0 && (
                    <Text style={styles.templateHolidays}>
                      Libur: {template.holidays.length} periode
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noTemplatesCard}>
              <Text style={styles.noTemplatesIcon}>📋</Text>
              <Text style={styles.noTemplatesText}>Belum ada template</Text>
              <Text style={styles.noTemplatesDesc}>
                Template akan tersimpan saat Anda membuat timeline dan memilih
                opsi "Simpan sebagai template"
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  activeTimelineSection: {
    marginBottom: 32,
  },
  timelineCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timelineName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },
  timelineDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "600",
    flex: 1.5,
    textAlign: "right",
  },
  simulationSection: {
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  simulationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369a1",
    marginBottom: 16,
    textAlign: "center",
  },
  currentSimulationInfo: {
    backgroundColor: "#dbeafe",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentSimulationLabel: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
    marginBottom: 4,
  },
  currentSimulationValue: {
    fontSize: 14,
    color: "#1e40af",
    fontWeight: "600",
  },
  updateDateButton: {
    backgroundColor: "#0369a1",
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: "#dbeafe",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#1e40af",
    lineHeight: 16,
  },
  rangeInfoBox: {
    backgroundColor: "#ecfdf5",
    padding: 10,
    borderRadius: 6,
  },
  rangeInfoText: {
    fontSize: 12,
    color: "#047857",
    textAlign: "center",
  },
  timelineActions: {
    gap: 12,
  },
  manageButton: {
    backgroundColor: "#3b82f6",
  },
  updateButton: {
    backgroundColor: "#059669",
  },
  dangerActions: {
    flexDirection: "row",
    gap: 12,
  },
  resetButton: {
    flex: 1,
    borderColor: "#f59e0b",
  },
  deleteButton: {
    flex: 1,
    borderColor: "#ef4444",
  },
  noTimelineCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 40,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  noTimelineIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noTimelineText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
    textAlign: "center",
  },
  noTimelineDesc: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  actionsSection: {
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: "#10b981",
    marginBottom: 12,
  },
  warningBox: {
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  warningText: {
    fontSize: 14,
    color: "#92400e",
    textAlign: "center",
    lineHeight: 18,
  },
  templatesSection: {
    marginBottom: 32,
  },
  templateCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  templateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  templateDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
  templateDetails: {
    gap: 4,
  },
  templateType: {
    fontSize: 14,
    color: "#64748b",
  },
  templateAmount: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "500",
  },
  templateHolidays: {
    fontSize: 12,
    color: "#f59e0b",
  },
  noTemplatesCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 32,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  noTemplatesIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  noTemplatesText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
    marginBottom: 8,
    textAlign: "center",
  },
  noTemplatesDesc: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
});
