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
  Dimensions,
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

const { width } = Dimensions.get('window');

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
      "Pilih tindakan untuk data pembayaran warga:",
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
      ? `Timeline "${activeTimeline.name}" dan SEMUA data pembayaran warga akan dihapus.\n\n⚠️ PERINGATAN: Semua riwayat pembayaran warga akan hilang permanen!`
      : `Timeline "${activeTimeline.name}" akan dihapus, tetapi data pembayaran warga akan dipertahankan untuk referensi.`;

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
                : "Timeline berhasil dihapus, data pembayaran warga dipertahankan.";
              
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
            colors={["#002245"]}
            tintColor={"#002245"}
            title="Memuat ulang..."
            titleColor={"#64748b"}
          />
        }
      >
        {/* Timeline Overview Card */}
        {activeTimeline && (
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View style={styles.overviewIcon}>
                <Text style={styles.overviewIconText}>📊</Text>
              </View>
              <View style={styles.overviewInfo}>
                <Text style={styles.overviewTitle}>Timeline Overview</Text>
                <Text style={styles.overviewSubtitle}>Ringkasan timeline aktif</Text>
              </View>
              <View style={styles.statusIndicator}>
                <View style={styles.activeStatusDot} />
                <Text style={styles.activeStatusText}>Aktif</Text>
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{getActivePeriods(activeTimeline)}</Text>
                <Text style={styles.statLabel}>Periode Aktif</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{activeTimeline.duration}</Text>
                <Text style={styles.statLabel}>Total Periode</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formatCurrency(activeTimeline.amountPerPeriod)}</Text>
                <Text style={styles.statLabel}>Per Periode</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.activeTimelineSection}>
          <Text style={styles.sectionTitle}>🎯 Timeline Aktif</Text>

          {activeTimeline ? (
            <View style={styles.timelineCard}>
              <View style={styles.timelineHeader}>
                <View style={styles.timelineHeaderLeft}>
                  <Text style={styles.timelineName}>{activeTimeline.name}</Text>
                  <Text style={styles.timelineType}>
                    {getTypeLabel(activeTimeline.type)} • {getTotalTimelineDuration(activeTimeline)}
                  </Text>
                </View>
                <View style={styles.timelineBadges}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>🟢 Aktif</Text>
                  </View>
                  <View style={styles.modeBadge}>
                    <Text style={styles.modeText}>
                      {activeTimeline.mode === "manual" ? "⚙️ Manual" : "🕐 Real-time"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Visual Timeline Display */}
              <View style={styles.visualTimelineContainer}>
                <Text style={styles.visualTimelineTitle}>📅 Visual Timeline</Text>
                <View style={styles.timelineRange}>
                  <Text style={styles.timelineRangeText}>
                    {formatTimelineRange(activeTimeline)}
                  </Text>
                </View>
                
                {/* Timeline Periods Display */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.periodsScrollView}
                  contentContainerStyle={styles.periodsContainer}
                >
                  {activeTimeline.periods && Object.entries(activeTimeline.periods).map(([key, period], index) => (
                    <View key={key} style={styles.periodCardContainer}>
                      <View style={[
                        styles.periodCard,
                        period.active ? styles.activePeriodCard : styles.inactivePeriodCard
                      ]}>
                        <Text style={[
                          styles.periodNumber,
                          period.active ? styles.activePeriodNumber : styles.inactivePeriodNumber
                        ]}>
                          {index + 1}
                        </Text>
                        <Text style={[
                          styles.periodLabel,
                          period.active ? styles.activePeriodLabel : styles.inactivePeriodLabel
                        ]}>
                          {period.label}
                        </Text>
                        <View style={[
                          styles.periodStatus,
                          period.active ? styles.activePeriodStatus : styles.inactivePeriodStatus
                        ]}>
                          <Text style={[
                            styles.periodStatusText,
                            period.active ? styles.activePeriodStatusText : styles.inactivePeriodStatusText
                          ]}>
                            {period.active ? '●' : '○'}
                          </Text>
                        </View>
                      </View>
                      {index < Object.keys(activeTimeline.periods).length - 1 && (
                        <View style={styles.periodConnector} />
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* Timeline Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailCardIcon}>💰</Text>
                  <Text style={styles.detailCardLabel}>Total Amount</Text>
                  <Text style={styles.detailCardValue}>{formatCurrency(activeTimeline.totalAmount)}</Text>
                </View>
                <View style={styles.detailCard}>
                  <Text style={styles.detailCardIcon}>📅</Text>
                  <Text style={styles.detailCardLabel}>Per Periode</Text>
                  <Text style={styles.detailCardValue}>{formatCurrency(activeTimeline.amountPerPeriod)}</Text>
                </View>
              </View>

              {/* Manual Simulation Control Card */}
              {activeTimeline.mode === "manual" && (
                <View style={styles.simulationCard}>
                  <View style={styles.simulationHeader}>
                    <Text style={styles.simulationIcon}>⚙️</Text>
                    <View style={styles.simulationHeaderText}>
                      <Text style={styles.simulationTitle}>Kontrol Waktu Manual</Text>
                      <Text style={styles.simulationSubtitle}>Atur waktu simulasi timeline</Text>
                    </View>
                  </View>

                  <View style={styles.currentSimulationCard}>
                    <Text style={styles.currentSimulationLabel}>Waktu Simulasi Saat Ini</Text>
                    <Text style={styles.currentSimulationValue}>
                      {formatSimulationDateTime(activeTimeline.simulationDate)}
                    </Text>
                  </View>

                  <TimelinePicker
                    label={`Atur Waktu Simulasi (${getTypeLabel(activeTimeline.type)})`}
                    value={simulationDateTime}
                    onChange={setSimulationDateTime}
                    timelineType={activeTimeline.type}
                    minDate={activeTimeline.startDate}
                    maxDate={calculateEndDate(activeTimeline)}
                    placeholder={`Pilih waktu simulasi dalam range timeline`}
                  />

                  <Button
                    title={updating ? "Memperbarui..." : "⚡ Update Waktu Simulasi"}
                    onPress={handleUpdateSimulationDateTime}
                    disabled={updating}
                    style={styles.updateDateButton}
                  />

                  <View style={styles.simulationInfoCard}>
                    <Text style={styles.simulationInfoText}>
                      💡 Mengubah waktu simulasi akan mempengaruhi perhitungan status "terlambat" 
                      untuk semua pembayaran berdasarkan timeline {getTypeLabel(activeTimeline.type).toLowerCase()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Cards */}
              <View style={styles.actionCardsContainer}>
                <View style={styles.primaryActionCard}>
                  <Text style={styles.actionCardIcon}>💼</Text>
                  <Text style={styles.actionCardTitle}>Kelola Pembayaran</Text>
                  <Text style={styles.actionCardDesc}>Lihat dan kelola status pembayaran warga</Text>
                  <Button
                    title="Buka Payment Manager"
                    onPress={handleManagePayments}
                    style={styles.primaryActionButton}
                  />
                </View>

                <View style={styles.secondaryActionCard}>
                  <Text style={styles.actionCardIcon}>🔄</Text>
                  <Text style={styles.actionCardTitle}>Update Status</Text>
                  <Text style={styles.actionCardDesc}>Perbarui status pembayaran otomatis</Text>
                  <Button
                    title={updating ? "Memperbarui..." : "Update Sekarang"}
                    onPress={handleBulkUpdateStatus}
                    disabled={updating}
                    style={styles.secondaryActionButton}
                  />
                </View>
              </View>

              {/* Danger Zone Card */}
              <View style={styles.dangerZoneCard}>
                <View style={styles.dangerZoneHeader}>
                  <Text style={styles.dangerZoneIcon}>⚠️</Text>
                  <View>
                    <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
                    <Text style={styles.dangerZoneSubtitle}>Tindakan berisiko tinggi</Text>
                  </View>
                </View>
                
                <View style={styles.dangerActions}>
                  <Button
                    title={resetting ? "Mereset..." : "🔄 Reset Pembayaran"}
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
              <View style={styles.noTimelineIconContainer}>
                <Text style={styles.noTimelineIcon}>📅</Text>
              </View>
              <Text style={styles.noTimelineText}>Belum ada timeline aktif</Text>
              <Text style={styles.noTimelineDesc}>
                Buat timeline baru untuk mulai mengelola pembayaran jimpitan warga
              </Text>
              <Button
                title="🚀 Buat Timeline Pertama"
                onPress={handleCreateTimeline}
                style={styles.noTimelineButton}
              />
            </View>
          )}
        </View>

        {/* Create Timeline Action Card */}
        {activeTimeline && (
          <View style={styles.createTimelineCard}>
            <View style={styles.createTimelineHeader}>
              <Text style={styles.createTimelineIcon}>➕</Text>
              <View>
                <Text style={styles.createTimelineTitle}>Buat Timeline Baru</Text>
                <Text style={styles.createTimelineSubtitle}>Gantikan timeline aktif saat ini</Text>
              </View>
            </View>
            
            <Text style={styles.createTimelineWarning}>
              ⚠️ Membuat timeline baru akan mengganti timeline aktif saat ini
            </Text>
            
            <Button
              title="🎯 Buat Timeline Baru"
              onPress={handleCreateTimeline}
              style={styles.createTimelineButton}
            />
          </View>
        )}

        {/* Template Library Section */}
        <View style={styles.templatesSection}>
          <View style={styles.templatesSectionHeader}>
            <Text style={styles.sectionTitle}>📚 Template Library</Text>
            <Text style={styles.sectionSubtitle}>Template timeline tersimpan</Text>
          </View>

          {templates.length > 0 ? (
            <View style={styles.templatesGrid}>
              {templates.map((template) => (
                <View key={template.id} style={styles.templateCard}>
                  <View style={styles.templateCardHeader}>
                    <View style={styles.templateIconContainer}>
                      <Text style={styles.templateIcon}>📋</Text>
                    </View>
                    <View style={styles.templateInfo}>
                      <Text style={styles.templateName}>{template.name}</Text>
                      <Text style={styles.templateDate}>
                        {new Date(template.createdAt?.toDate()).toLocaleDateString("id-ID")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.templateMetrics}>
                    <View style={styles.templateMetric}>
                      <Text style={styles.templateMetricIcon}>⏱️</Text>
                      <Text style={styles.templateMetricText}>
                        {getTypeLabel(template.type)}
                      </Text>
                    </View>
                    <View style={styles.templateMetric}>
                      <Text style={styles.templateMetricIcon}>📊</Text>
                      <Text style={styles.templateMetricText}>
                        {template.duration} periode
                      </Text>
                    </View>
                    <View style={styles.templateMetric}>
                      <Text style={styles.templateMetricIcon}>💰</Text>
                      <Text style={styles.templateMetricText}>
                        {formatCurrency(template.baseAmount)}
                      </Text>
                    </View>
                    {template.holidays && template.holidays.length > 0 && (
                      <View style={styles.templateMetric}>
                        <Text style={styles.templateMetricIcon}>🏖️</Text>
                        <Text style={styles.templateMetricText}>
                          {template.holidays.length} libur
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noTemplatesCard}>
              <View style={styles.noTemplatesIconContainer}>
                <Text style={styles.noTemplatesIcon}>📋</Text>
              </View>
              <Text style={styles.noTemplatesText}>Belum ada template tersimpan</Text>
              <Text style={styles.noTemplatesDesc}>
                Template akan tersimpan otomatis saat Anda membuat timeline dan memilih 
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
    backgroundColor: "#f1f5f9",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#002245",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#002245",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#002245",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: -12,
    marginBottom: 16,
  },
  
  // Overview Card Styles
  overviewCard: {
    backgroundColor: "#002245",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 8,
    shadowColor: "#002245",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  overviewIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  overviewIconText: {
    fontSize: 24,
  },
  overviewInfo: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  overviewSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 6,
  },
  activeStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#22c55e",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 16,
  },
  
  activeTimelineSection: {
    marginBottom: 24,
  },
  timelineCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    elevation: 6,
    shadowColor: "#002245",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  timelineHeaderLeft: {
    flex: 1,
    marginRight: 16,
  },
  timelineName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#002245",
    marginBottom: 4,
  },
  timelineType: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  timelineBadges: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },
  modeBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1d4ed8",
  },
  // Visual Timeline Display
  visualTimelineContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  visualTimelineTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#002245",
    marginBottom: 12,
    textAlign: "center",
  },
  timelineRange: {
    backgroundColor: "#dbeafe",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  timelineRangeText: {
    fontSize: 14,
    color: "#1e40af",
    fontWeight: "600",
    textAlign: "center",
  },
  periodsScrollView: {
    maxHeight: 120,
  },
  periodsContainer: {
    paddingHorizontal: 4,
    alignItems: "center",
  },
  periodCardContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  periodCard: {
    width: 80,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  activePeriodCard: {
    backgroundColor: "#002245",
  },
  inactivePeriodCard: {
    backgroundColor: "#e2e8f0",
  },
  periodNumber: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  activePeriodNumber: {
    color: "#fff",
  },
  inactivePeriodNumber: {
    color: "#64748b",
  },
  periodLabel: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 6,
  },
  activePeriodLabel: {
    color: "rgba(255, 255, 255, 0.9)",
  },
  inactivePeriodLabel: {
    color: "#94a3b8",
  },
  periodStatus: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  activePeriodStatus: {
    backgroundColor: "rgba(34, 197, 94, 0.3)",
  },
  inactivePeriodStatus: {
    backgroundColor: "rgba(148, 163, 184, 0.3)",
  },
  periodStatusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  activePeriodStatusText: {
    color: "#22c55e",
  },
  inactivePeriodStatusText: {
    color: "#94a3b8",
  },
  periodConnector: {
    width: 16,
    height: 2,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 0,
  },
  
  // Details Grid
  detailsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  detailCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  detailCardIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  detailCardLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 4,
    textAlign: "center",
  },
  detailCardValue: {
    fontSize: 14,
    color: "#002245",
    fontWeight: "700",
    textAlign: "center",
  },
  // Simulation Control Card
  simulationCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  simulationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  simulationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  simulationHeaderText: {
    flex: 1,
  },
  simulationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#002245",
  },
  simulationSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  currentSimulationCard: {
    backgroundColor: "#dbeafe",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  currentSimulationLabel: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
    marginBottom: 6,
  },
  currentSimulationValue: {
    fontSize: 16,
    color: "#1e40af",
    fontWeight: "700",
  },
  updateDateButton: {
    backgroundColor: "#002245",
    marginBottom: 16,
  },
  simulationInfoCard: {
    backgroundColor: "#ecfef9",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  simulationInfoText: {
    fontSize: 14,
    color: "#065f46",
    lineHeight: 20,
  },
  // Action Cards
  actionCardsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  primaryActionCard: {
    flex: 1,
    backgroundColor: "#f0f9ff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    alignItems: "center",
  },
  secondaryActionCard: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    alignItems: "center",
  },
  actionCardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#002245",
    marginBottom: 6,
    textAlign: "center",
  },
  actionCardDesc: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 16,
  },
  primaryActionButton: {
    backgroundColor: "#002245",
    minWidth: 120,
  },
  secondaryActionButton: {
    backgroundColor: "#059669",
    minWidth: 120,
  },
  
  // Danger Zone Card
  dangerZoneCard: {
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  dangerZoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dangerZoneIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#dc2626",
  },
  dangerZoneSubtitle: {
    fontSize: 14,
    color: "#991b1b",
    marginTop: 2,
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
  // No Timeline Card
  noTimelineCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  noTimelineIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  noTimelineIcon: {
    fontSize: 40,
  },
  noTimelineText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#002245",
    marginBottom: 12,
    textAlign: "center",
  },
  noTimelineDesc: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  noTimelineButton: {
    backgroundColor: "#002245",
    minWidth: 200,
  },
  // Create Timeline Card
  createTimelineCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  createTimelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  createTimelineIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  createTimelineTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#002245",
  },
  createTimelineSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  createTimelineWarning: {
    fontSize: 14,
    color: "#f59e0b",
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  createTimelineButton: {
    backgroundColor: "#002245",
  },
  // Templates Section
  templatesSection: {
    marginBottom: 24,
  },
  templatesSectionHeader: {
    marginBottom: 16,
  },
  templatesGrid: {
    gap: 16,
  },
  // Template Cards
  templateCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  templateCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  templateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  templateIcon: {
    fontSize: 20,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#002245",
    marginBottom: 2,
  },
  templateDate: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  templateMetrics: {
    gap: 8,
  },
  templateMetric: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  templateMetricIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  templateMetricText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  // No Templates Card
  noTemplatesCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  noTemplatesIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noTemplatesIcon: {
    fontSize: 28,
  },
  noTemplatesText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#002245",
    marginBottom: 12,
    textAlign: "center",
  },
  noTemplatesDesc: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
});
