import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Surface,
  Text,
  Card,
  Avatar,
  Chip,
  IconButton,
  ActivityIndicator,
  useTheme,
  Divider
} from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../components/ui/Button";
import TimelinePicker from "../../components/ui/TimelinePicker";
import { ScrollView } from 'react-native';
import Animated, { FadeInDown, SlideInUp, SlideInRight } from 'react-native-reanimated';
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
  const paperTheme = useTheme();

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
      "Pilih tindakan untuk data setoran warga:",
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
      ? `Timeline "${activeTimeline.name}" dan SEMUA data setoran warga akan dihapus.\n\n⚠️ PERINGATAN: Semua riwayat setoran warga akan hilang permanen!`
      : `Timeline "${activeTimeline.name}" akan dihapus, tetapi data setoran warga akan dipertahankan untuk referensi.`;

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
                : "Timeline berhasil dihapus, data setoran warga dipertahankan.";
              
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
      <LinearGradient
        colors={[paperTheme.colors.primaryContainer, paperTheme.colors.background]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <Surface style={styles.header} elevation={2}>
          <IconButton
            icon="arrow-left"
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Timeline Manager
          </Text>
          <View style={styles.placeholder} />
        </Surface>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" animating />
          <Text variant="bodyLarge" style={{ marginTop: 16 }}>
            Memuat data timeline...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[paperTheme.colors.primaryContainer, paperTheme.colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <Surface style={styles.header} elevation={2}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Timeline Manager 
        </Text>
        <View style={styles.placeholder} />
      </Surface>

      <View style={styles.content}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[paperTheme.colors.primary]}
              tintColor={paperTheme.colors.primary}
            />
          }
        >
          <Animated.View entering={FadeInDown.delay(100)} style={styles.activeTimelineSection}>
            <Text variant="headlineSmall" style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>Timeline Aktif</Text>

            {activeTimeline ? (
              <Card style={styles.timelineCard} mode="elevated">
                <Card.Content>
                  <View style={styles.timelineHeader}>
                    <Avatar.Icon 
                      size={48} 
                      icon="timeline" 
                      style={{ backgroundColor: paperTheme.colors.primary }}
                      color={paperTheme.colors.onPrimary}
                    />
                    <View style={styles.timelineHeaderInfo}>
                      <Text variant="titleLarge" style={[styles.timelineName, { fontWeight: 'bold' }]}>{activeTimeline.name}</Text>
                      <Chip 
                        icon="check-circle"
                        mode="flat"
                        style={{ 
                          backgroundColor: paperTheme.colors.successContainer,
                          alignSelf: 'flex-start'
                        }}
                        textStyle={{ 
                          color: paperTheme.colors.onSuccessContainer,
                          fontSize: 12
                        }}
                      >
                        Aktif
                      </Chip>
                    </View>
                  </View>

                  <Divider style={{ marginVertical: 16 }} />

                  <View style={styles.timelineDetails}>
                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={[styles.detailLabel, { color: paperTheme.colors.onSurfaceVariant }]}>Tipe:</Text>
                      <Text variant="bodyMedium" style={[styles.detailValue, { color: paperTheme.colors.onSurface, fontWeight: '600' }]}>
                        {getTypeLabel(activeTimeline.type)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={[styles.detailLabel, { color: paperTheme.colors.onSurfaceVariant }]}>Durasi:</Text>
                      <Text variant="bodyMedium" style={[styles.detailValue, { color: paperTheme.colors.onSurface, fontWeight: '600' }]}>
                        {getTotalTimelineDuration(activeTimeline)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={[styles.detailLabel, { color: paperTheme.colors.onSurfaceVariant }]}>Range Timeline:</Text>
                      <Text variant="bodyMedium" style={[styles.detailValue, { color: paperTheme.colors.onSurface, fontWeight: '600' }]}>
                        {formatTimelineRange(activeTimeline)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={[styles.detailLabel, { color: paperTheme.colors.onSurfaceVariant }]}>Periode Aktif:</Text>
                      <Text variant="bodyMedium" style={[styles.detailValue, { color: paperTheme.colors.onSurface, fontWeight: '600' }]}>
                        {getActivePeriods(activeTimeline)} periode
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={[styles.detailLabel, { color: paperTheme.colors.onSurfaceVariant }]}>Mode:</Text>
                      <Text variant="bodyMedium" style={[styles.detailValue, { color: paperTheme.colors.onSurface, fontWeight: '600' }]}>
                        {activeTimeline.mode === "manual"
                          ? "⚙️ Manual"
                          : "🕐 Real-time"}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={[styles.detailLabel, { color: paperTheme.colors.onSurfaceVariant }]}>Total Amount:</Text>
                      <Text variant="bodyMedium" style={[styles.detailValue, { color: paperTheme.colors.onSurface, fontWeight: '600' }]}>
                        {formatCurrency(activeTimeline.totalAmount)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text variant="bodyMedium" style={[styles.detailLabel, { color: paperTheme.colors.onSurfaceVariant }]}>Per Periode:</Text>
                      <Text variant="bodyMedium" style={[styles.detailValue, { color: paperTheme.colors.onSurface, fontWeight: '600' }]}>
                        {formatCurrency(activeTimeline.amountPerPeriod)}
                      </Text>
                    </View>
                  </View>

                  {activeTimeline.mode === "manual" && (
                    <View style={[styles.simulationSection, { backgroundColor: paperTheme.colors.primaryContainer }]}>
                      <Text variant="titleMedium" style={[styles.simulationTitle, { color: paperTheme.colors.onPrimaryContainer }]}>
                        🕐 Kontrol Waktu Manual
                      </Text>

                      <Card style={[styles.currentSimulationInfo, { backgroundColor: paperTheme.colors.surface }]} mode="contained">
                        <Card.Content style={{ paddingVertical: 12 }}>
                          <Text variant="bodySmall" style={[styles.currentSimulationLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
                            Waktu Simulasi Saat Ini:
                          </Text>
                          <Text variant="bodyMedium" style={[styles.currentSimulationValue, { color: paperTheme.colors.onSurface, fontWeight: '600' }]}>
                            {formatSimulationDateTime(activeTimeline.simulationDate)}
                          </Text>
                        </Card.Content>
                      </Card>

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

                      <Card style={[styles.infoCard, { backgroundColor: paperTheme.colors.tertiaryContainer }]} mode="contained">
                        <Card.Content style={{ paddingVertical: 12 }}>
                          <Text variant="bodySmall" style={{ color: paperTheme.colors.onTertiaryContainer, lineHeight: 18 }}>
                            ℹ️ Mengubah waktu simulasi akan mempengaruhi perhitungan status "terlambat" untuk semua pembayaran berdasarkan timeline {getTypeLabel(activeTimeline.type).toLowerCase()}
                          </Text>
                        </Card.Content>
                      </Card>

                      <Card style={[styles.rangeInfoCard, { backgroundColor: paperTheme.colors.successContainer }]} mode="contained">
                        <Card.Content style={{ paddingVertical: 8 }}>
                          <Text variant="bodySmall" style={{ color: paperTheme.colors.onSuccessContainer, textAlign: 'center' }}>
                            📅 Range simulasi yang diizinkan: {formatTimelineRange(activeTimeline)}
                          </Text>
                        </Card.Content>
                      </Card>
                    </View>
                  )}

                  <Divider style={{ marginVertical: 16 }} />

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
                </Card.Content>
              </Card>
            ) : (
              <Card style={styles.noTimelineCard} mode="outlined">
                <Card.Content style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Avatar.Icon 
                    size={80} 
                    icon="calendar-blank" 
                    style={{ backgroundColor: paperTheme.colors.surfaceVariant }}
                    color={paperTheme.colors.onSurfaceVariant}
                  />
                  <Text variant="headlineSmall" style={[styles.noTimelineText, { color: paperTheme.colors.onSurfaceVariant, marginTop: 16, marginBottom: 8 }]}>
                    Belum ada timeline aktif
                  </Text>
                  <Text variant="bodyMedium" style={[styles.noTimelineDesc, { color: paperTheme.colors.onSurfaceVariant, textAlign: 'center' }]}>
                    Buat timeline baru untuk mulai mengelola setoran jimpitan
                  </Text>
                </Card.Content>
              </Card>
            )}
          </Animated.View>

          <Animated.View entering={SlideInUp.delay(200)} style={styles.actionsSection}>
            <Button
              title={
                activeTimeline ? "Buat Timeline Baru" : "Buat Timeline Pertama"
              }
              onPress={handleCreateTimeline}
              style={styles.createButton}
            />

            {activeTimeline && (
              <Card style={[styles.warningCard, { backgroundColor: paperTheme.colors.warningContainer }]} mode="contained">
                <Card.Content style={{ paddingVertical: 12 }}>
                  <Text variant="bodySmall" style={{ color: paperTheme.colors.onWarningContainer, textAlign: 'center', lineHeight: 18 }}>
                    ⚠️ Membuat timeline baru akan mengganti timeline aktif saat ini
                  </Text>
                </Card.Content>
              </Card>
            )}
          </Animated.View>

          <Animated.View entering={SlideInRight.delay(300)} style={styles.templatesSection}>
            <Text variant="headlineSmall" style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>Template Tersimpan</Text>

            {templates.length > 0 ? (
              templates.map((template, index) => (
                <Animated.View key={template.id} entering={SlideInRight.delay(400 + index * 100)}>
                  <Card style={styles.templateCard} mode="outlined">
                    <Card.Content>
                      <View style={styles.templateHeader}>
                        <Avatar.Icon 
                          size={40} 
                          icon="file-document" 
                          style={{ backgroundColor: paperTheme.colors.secondaryContainer }}
                          color={paperTheme.colors.onSecondaryContainer}
                        />
                        <View style={styles.templateHeaderInfo}>
                          <Text variant="titleMedium" style={[styles.templateName, { color: paperTheme.colors.onSurface, fontWeight: '600' }]}>{template.name}</Text>
                          <Text variant="bodySmall" style={[styles.templateDate, { color: paperTheme.colors.onSurfaceVariant }]}>
                            {new Date(template.createdAt?.toDate()).toLocaleDateString(
                              "id-ID"
                            )}
                          </Text>
                        </View>
                      </View>

                      <Divider style={{ marginVertical: 12 }} />

                      <View style={styles.templateDetails}>
                        <Text variant="bodyMedium" style={[styles.templateType, { color: paperTheme.colors.onSurfaceVariant }]}>
                          {getTypeLabel(template.type)} - {template.duration} periode
                        </Text>
                        <Text variant="bodyMedium" style={[styles.templateAmount, { color: paperTheme.colors.success, fontWeight: '500' }]}>
                          Base: {formatCurrency(template.baseAmount)}
                        </Text>
                        {template.holidays && template.holidays.length > 0 && (
                          <Text variant="bodySmall" style={[styles.templateHolidays, { color: paperTheme.colors.warning }]}>
                            Libur: {template.holidays.length} periode
                          </Text>
                        )}
                      </View>
                    </Card.Content>
                  </Card>
                </Animated.View>
              ))
            ) : (
              <Card style={styles.noTemplatesCard} mode="outlined">
                <Card.Content style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Avatar.Icon 
                    size={64} 
                    icon="file-document-outline" 
                    style={{ backgroundColor: paperTheme.colors.surfaceVariant }}
                    color={paperTheme.colors.onSurfaceVariant}
                  />
                  <Text variant="titleMedium" style={[styles.noTemplatesText, { color: paperTheme.colors.onSurfaceVariant, marginTop: 12, marginBottom: 8 }]}>Belum ada template</Text>
                  <Text variant="bodyMedium" style={[styles.noTemplatesDesc, { color: paperTheme.colors.onSurfaceVariant, textAlign: 'center' }]}>
                    Template akan tersimpan saat Anda membuat timeline dan memilih opsi "Simpan sebagai template"
                  </Text>
                </Card.Content>
              </Card>
            )}
          </Animated.View>
        </ScrollView>
      </View>
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
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    padding: 4,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  activeTimelineSection: {
    marginBottom: 24,
  },
  timelineCard: {
    borderRadius: 16,
    marginBottom: 16,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  timelineHeaderInfo: {
    flex: 1,
    gap: 8,
  },
  timelineName: {
    flex: 1,
  },
  timelineDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  detailLabel: {
    flex: 1,
  },
  detailValue: {
    flex: 1.5,
    textAlign: 'right',
  },
  simulationSection: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 16,
  },
  simulationTitle: {
    textAlign: 'center',
  },
  currentSimulationInfo: {
    borderRadius: 8,
  },
  currentSimulationLabel: {
    marginBottom: 4,
  },
  currentSimulationValue: {
  },
  updateDateButton: {
    marginBottom: 8,
  },
  infoCard: {
    borderRadius: 8,
  },
  rangeInfoCard: {
    borderRadius: 6,
  },
  timelineActions: {
    gap: 12,
  },
  manageButton: {
  },
  updateButton: {
  },
  dangerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
  noTimelineCard: {
    borderRadius: 16,
  },
  noTimelineText: {
    fontWeight: '600',
  },
  noTimelineDesc: {
    lineHeight: 20,
  },
  actionsSection: {
    marginBottom: 24,
  },
  createButton: {
    marginBottom: 12,
  },
  warningCard: {
    borderRadius: 8,
  },
  templatesSection: {
    marginBottom: 24,
  },
  templateCard: {
    borderRadius: 16,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  templateHeaderInfo: {
    flex: 1,
  },
  templateName: {
    flex: 1,
  },
  templateDate: {
  },
  templateDetails: {
    gap: 4,
  },
  templateType: {
  },
  templateAmount: {
  },
  templateHolidays: {
  },
  noTemplatesCard: {
    borderRadius: 12,
  },
  noTemplatesText: {
    fontWeight: '500',
  },
  noTemplatesDesc: {
    lineHeight: 20,
  },
});
