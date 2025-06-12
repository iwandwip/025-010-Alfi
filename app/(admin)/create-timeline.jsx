import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import TimelinePicker from "../../components/ui/TimelinePicker";
import {
  createTimelineTemplate,
  createActiveTimeline,
  generatePaymentsForTimeline,
  getTimelineTemplates,
} from "../../services/timelineService";

export default function CreateTimeline() {
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "monthly",
    duration: 12,
    baseAmount: 480000,
    totalAmount: 480000,
    startDate: new Date().toISOString(),
    mode: "realtime",
    simulationDate: new Date().toISOString(),
    holidays: [],
    saveAsTemplate: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const result = await getTimelineTemplates();
    if (result.success) {
      setTemplates(result.templates);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === "type" || field === "duration" || field === "baseAmount") {
        newData.totalAmount = calculateTotalAmount(newData);
      }

      if (field === "type" || field === "duration") {
        newData.holidays = [];
      }

      if (field === "startDate" || field === "type" || field === "duration") {
        const endDate = calculateEndDate(
          newData.startDate,
          newData.type,
          newData.duration
        );
        if (new Date(newData.simulationDate) > new Date(endDate)) {
          newData.simulationDate = endDate;
        }
      }

      return newData;
    });
  };

  const calculateEndDate = (startDate, type, duration) => {
    const start = new Date(startDate);
    const end = new Date(start);

    switch (type) {
      case "yearly":
        end.setFullYear(start.getFullYear() + duration - 1);
        end.setMonth(11);
        end.setDate(31);
        end.setHours(23, 59, 59, 999);
        break;
      case "monthly":
        end.setMonth(start.getMonth() + duration - 1);
        const lastDayOfMonth = new Date(
          end.getFullYear(),
          end.getMonth() + 1,
          0
        ).getDate();
        end.setDate(lastDayOfMonth);
        end.setHours(23, 59, 59, 999);
        break;
      case "weekly":
        end.setDate(start.getDate() + (duration - 1) * 7);
        end.setHours(23, 59, 59, 999);
        break;
      case "daily":
        end.setDate(start.getDate() + duration - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "hourly":
        end.setHours(start.getHours() + duration - 1);
        end.setMinutes(59, 59, 999);
        break;
      case "minute":
        end.setMinutes(start.getMinutes() + duration - 1);
        end.setSeconds(59, 999);
        break;
      default:
        end.setDate(start.getDate() + duration - 1);
        end.setHours(23, 59, 59, 999);
    }

    return end.toISOString();
  };

  const getTimelineEndDate = () => {
    return calculateEndDate(
      formData.startDate,
      formData.type,
      formData.duration
    );
  };

  const calculateTotalAmount = (data) => {
    return data.baseAmount * data.duration;
  };

  const calculateAmountPerPeriod = () => {
    const activePeriods = formData.duration - formData.holidays.length;
    return activePeriods > 0
      ? Math.ceil(formData.totalAmount / activePeriods)
      : 0;
  };

  const getTimelineTypes = () => [
    { value: "yearly", label: "Tahunan", unit: "Tahun", maxPeriods: 50 },
    { value: "monthly", label: "Bulanan", unit: "Bulan", maxPeriods: 365 },
    { value: "weekly", label: "Mingguan", unit: "Minggu", maxPeriods: 365 },
    { value: "daily", label: "Harian", unit: "Hari", maxPeriods: 365 },
    { value: "hourly", label: "Jam-an", unit: "Jam", maxPeriods: 365 },
    { value: "minute", label: "Menitan", unit: "Menit", maxPeriods: 365 },
  ];

  const getSelectedType = () => {
    return getTimelineTypes().find((type) => type.value === formData.type);
  };

  const validateDuration = (duration, type) => {
    const typeConfig = getTimelineTypes().find((t) => t.value === type);
    if (duration < 1) return false;
    if (duration > typeConfig.maxPeriods) return false;
    return true;
  };

  const getTotalTimelineDuration = () => {
    const type = formData.type;
    const duration = formData.duration;

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

  const handleTypeChange = (type) => {
    const typeConfig = getTimelineTypes().find((t) => t.value === type);
    updateFormData("type", type);

    if (formData.duration > typeConfig.maxPeriods) {
      updateFormData("duration", typeConfig.maxPeriods);
    }
  };

  const handleDurationChange = (value) => {
    const duration = parseInt(value) || 0;
    const isValid = validateDuration(duration, formData.type);

    if (isValid) {
      updateFormData("duration", duration);
    }
  };

  const handleUseTemplate = (template) => {
    setFormData({
      ...formData,
      name: template.name,
      type: template.type,
      duration: template.duration,
      baseAmount: template.baseAmount,
      totalAmount: template.baseAmount * template.duration,
      holidays: template.holidays || [],
    });
  };

  const toggleHoliday = (periodNumber) => {
    const newHolidays = formData.holidays.includes(periodNumber)
      ? formData.holidays.filter((h) => h !== periodNumber)
      : [...formData.holidays, periodNumber];

    updateFormData("holidays", newHolidays);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        Alert.alert("Error", "Nama timeline wajib diisi");
        return;
      }
      if (!validateDuration(formData.duration, formData.type)) {
        const typeConfig = getSelectedType();
        Alert.alert(
          "Error",
          `Durasi harus antara 1-${
            typeConfig.maxPeriods
          } ${typeConfig.unit.toLowerCase()}`
        );
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleCreate = async () => {
    setLoading(true);

    try {
      if (formData.saveAsTemplate) {
        const templateResult = await createTimelineTemplate({
          name: formData.name,
          type: formData.type,
          duration: formData.duration,
          baseAmount: formData.baseAmount,
          holidays: formData.holidays,
        });

        if (!templateResult.success) {
          throw new Error(templateResult.error);
        }
      }

      const timelineId = `timeline_${Date.now()}`;
      const timelineData = {
        ...formData,
        id: timelineId,
        amountPerPeriod: calculateAmountPerPeriod(),
      };

      const timelineResult = await createActiveTimeline(timelineData);
      if (!timelineResult.success) {
        throw new Error(timelineResult.error);
      }

      const paymentsResult = await generatePaymentsForTimeline(timelineId);
      if (!paymentsResult.success) {
        throw new Error(paymentsResult.error);
      }

      Alert.alert(
        "Berhasil",
        "Timeline berhasil dibuat dan pembayaran sudah digenerate untuk semua santri!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(admin)/timeline-manager"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    }

    setLoading(false);
  };

  const renderPeriodSelector = () => {
    const periods = [];
    for (let i = 1; i <= formData.duration; i++) {
      periods.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.periodButton,
            formData.holidays.includes(i) && styles.periodButtonHoliday,
          ]}
          onPress={() => toggleHoliday(i)}
        >
          <Text
            style={[
              styles.periodButtonText,
              formData.holidays.includes(i) && styles.periodButtonTextHoliday,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    return periods;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatSimulationDisplay = () => {
    if (!formData.simulationDate) return "Tidak diset";

    const date = new Date(formData.simulationDate);
    const type = formData.type;

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

  const formatTimelineRange = () => {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(getTimelineEndDate());
    const type = formData.type;

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

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buat Timeline Baru</Text>
        </View>

        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 4 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 4 && styles.stepDotActive]} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Informasi Dasar</Text>

              {templates.length > 0 && (
                <View style={styles.templatesSection}>
                  <Text style={styles.templatesTitle}>Gunakan Template:</Text>
                  {templates.map((template) => (
                    <TouchableOpacity
                      key={template.id}
                      style={styles.templateCard}
                      onPress={() => handleUseTemplate(template)}
                    >
                      <Text style={styles.templateName}>{template.name}</Text>
                      <Text style={styles.templateDetails}>
                        {
                          getTimelineTypes().find(
                            (t) => t.value === template.type
                          )?.label
                        }{" "}
                        - {template.duration} periode
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Input
                label="Nama Timeline"
                placeholder="Contoh: TPQ Reguler 2024"
                value={formData.name}
                onChangeText={(value) => updateFormData("name", value)}
              />

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Tipe Timeline</Text>
                {getTimelineTypes().map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.typeButton,
                      formData.type === option.value && styles.typeButtonActive,
                    ]}
                    onPress={() => handleTypeChange(option.value)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.type === option.value &&
                          styles.typeButtonTextActive,
                      ]}
                    >
                      {option.label} (Max: {option.maxPeriods} {option.unit})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label={`Durasi (${getSelectedType()?.unit})`}
                placeholder={`Masukkan jumlah ${getSelectedType()?.unit.toLowerCase()}`}
                value={formData.duration.toString()}
                onChangeText={handleDurationChange}
                keyboardType="numeric"
              />

              <View style={styles.calculationInfo}>
                <Text style={styles.calculationText}>
                  Total Durasi: {getTotalTimelineDuration()}
                </Text>
              </View>

              <Input
                label="Amount Per Periode"
                placeholder="480000"
                value={formData.baseAmount.toString()}
                onChangeText={(value) =>
                  updateFormData("baseAmount", parseInt(value) || 0)
                }
                keyboardType="numeric"
              />

              <View style={styles.calculationInfo}>
                <Text style={styles.calculationText}>
                  Total Amount: {formatCurrency(formData.totalAmount)}
                </Text>
              </View>

              <TimelinePicker
                label={`Waktu Mulai Timeline (${getSelectedType()?.label})`}
                value={formData.startDate}
                onChange={(value) => updateFormData("startDate", value)}
                timelineType={formData.type}
                placeholder={`Pilih waktu mulai ${getSelectedType()?.label.toLowerCase()}`}
              />

              <View style={styles.timelineRangeInfo}>
                <Text style={styles.timelineRangeLabel}>Range Timeline:</Text>
                <Text style={styles.timelineRangeValue}>
                  {formatTimelineRange()}
                </Text>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Mode Timeline</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Mode Waktu</Text>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.mode === "realtime" && styles.typeButtonActive,
                  ]}
                  onPress={() => updateFormData("mode", "realtime")}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.mode === "realtime" &&
                        styles.typeButtonTextActive,
                    ]}
                  >
                    🕐 Real-time (Production)
                  </Text>
                  <Text style={styles.typeButtonDesc}>
                    Menggunakan waktu sekarang yang sebenarnya
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.mode === "manual" && styles.typeButtonActive,
                  ]}
                  onPress={() => updateFormData("mode", "manual")}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.mode === "manual" && styles.typeButtonTextActive,
                    ]}
                  >
                    ⚙️ Manual (Testing)
                  </Text>
                  <Text style={styles.typeButtonDesc}>
                    Bisa mengatur "waktu sekarang" untuk testing dalam range
                    timeline
                  </Text>
                </TouchableOpacity>
              </View>

              {formData.mode === "manual" && (
                <View style={styles.manualModeSection}>
                  <TimelinePicker
                    label={`Simulasi Waktu Sekarang (${
                      getSelectedType()?.label
                    })`}
                    value={formData.simulationDate}
                    onChange={(value) =>
                      updateFormData("simulationDate", value)
                    }
                    timelineType={formData.type}
                    minDate={formData.startDate}
                    maxDate={getTimelineEndDate()}
                    placeholder={`Pilih waktu simulasi dalam range timeline`}
                  />

                  <View style={styles.simulationPreview}>
                    <Text style={styles.simulationPreviewLabel}>
                      Waktu Simulasi yang Dipilih:
                    </Text>
                    <Text style={styles.simulationPreviewValue}>
                      {formatSimulationDisplay()}
                    </Text>
                  </View>

                  <View style={styles.rangeInfoBox}>
                    <Text style={styles.rangeInfoText}>
                      📅 Range simulasi: {formatTimelineRange()}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  {formData.mode === "realtime"
                    ? "ℹ️ Mode real-time akan menggunakan tanggal sekarang untuk menghitung status terlambat"
                    : `ℹ️ Mode manual memungkinkan Anda mengatur waktu simulasi dengan presisi ${getSelectedType()?.label.toLowerCase()} dalam range timeline untuk testing dan demo`}
                </Text>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Atur Periode Libur</Text>

              <Text style={styles.periodInstructions}>
                Tap pada nomor periode untuk menandai sebagai libur:
              </Text>

              <View style={styles.periodsGrid}>{renderPeriodSelector()}</View>

              <View style={styles.holidaySummary}>
                <Text style={styles.holidayText}>
                  Periode Libur: {formData.holidays.length} dari{" "}
                  {formData.duration}
                </Text>
                <Text style={styles.holidayText}>
                  Periode Aktif: {formData.duration - formData.holidays.length}
                </Text>
                <Text style={styles.amountPerPeriod}>
                  Amount per periode aktif:{" "}
                  {formatCurrency(calculateAmountPerPeriod())}
                </Text>
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Konfirmasi & Simpan</Text>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Ringkasan Timeline</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Nama:</Text>
                  <Text style={styles.summaryValue}>{formData.name}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tipe:</Text>
                  <Text style={styles.summaryValue}>
                    {getSelectedType()?.label}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Durasi:</Text>
                  <Text style={styles.summaryValue}>
                    {getTotalTimelineDuration()}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Range Timeline:</Text>
                  <Text style={styles.summaryValue}>
                    {formatTimelineRange()}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Mode:</Text>
                  <Text style={styles.summaryValue}>
                    {formData.mode === "realtime" ? "Real-time" : "Manual"}
                  </Text>
                </View>

                {formData.mode === "manual" && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Simulasi Waktu:</Text>
                    <Text style={styles.summaryValue}>
                      {formatSimulationDisplay()}
                    </Text>
                  </View>
                )}

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Amount:</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(formData.totalAmount)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Periode Libur:</Text>
                  <Text style={styles.summaryValue}>
                    {formData.holidays.length}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Per Periode:</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(calculateAmountPerPeriod())}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.templateToggle}
                onPress={() =>
                  updateFormData("saveAsTemplate", !formData.saveAsTemplate)
                }
              >
                <Text style={styles.templateToggleText}>
                  {formData.saveAsTemplate ? "✅" : "⬜"} Simpan sebagai
                  template
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.navigationButtons}>
            {step > 1 && (
              <Button
                title="Sebelumnya"
                onPress={() => setStep(step - 1)}
                variant="outline"
                style={styles.prevButton}
              />
            )}

            {step < 4 ? (
              <Button
                title="Selanjutnya"
                onPress={handleNext}
                style={styles.nextButton}
              />
            ) : (
              <Button
                title={loading ? "Membuat..." : "Buat Timeline"}
                onPress={handleCreate}
                disabled={loading}
                style={styles.createButton}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardContainer: {
    flex: 1,
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
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e2e8f0",
  },
  stepDotActive: {
    backgroundColor: "#3b82f6",
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 6,
  },
  stepLineActive: {
    backgroundColor: "#3b82f6",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContent: {
    paddingVertical: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 24,
    textAlign: "center",
  },
  templatesSection: {
    marginBottom: 24,
  },
  templatesTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  templateCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  templateName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  templateDetails: {
    fontSize: 12,
    color: "#64748b",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  typeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  typeButtonActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#dbeafe",
  },
  typeButtonText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    fontWeight: "600",
  },
  typeButtonTextActive: {
    color: "#3b82f6",
  },
  typeButtonDesc: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
  },
  calculationInfo: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  calculationText: {
    fontSize: 14,
    color: "#0369a1",
    fontWeight: "500",
  },
  timelineRangeInfo: {
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  timelineRangeLabel: {
    fontSize: 12,
    color: "#047857",
    fontWeight: "500",
    marginBottom: 4,
  },
  timelineRangeValue: {
    fontSize: 14,
    color: "#047857",
    fontWeight: "600",
  },
  manualModeSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  simulationPreview: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#dbeafe",
    borderRadius: 8,
  },
  simulationPreviewLabel: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
    marginBottom: 4,
  },
  simulationPreviewValue: {
    fontSize: 14,
    color: "#1e40af",
    fontWeight: "600",
  },
  rangeInfoBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#ecfdf5",
    borderRadius: 6,
  },
  rangeInfoText: {
    fontSize: 12,
    color: "#047857",
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#dbeafe",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 20,
  },
  periodInstructions: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    textAlign: "center",
  },
  periodsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  periodButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  periodButtonHoliday: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  periodButtonTextHoliday: {
    color: "#92400e",
  },
  holidaySummary: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  holidayText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  amountPerPeriod: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "600",
    flex: 1.5,
    textAlign: "right",
  },
  templateToggle: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 24,
  },
  templateToggleText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
  },
  navigationButtons: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 24,
  },
  prevButton: {
    flex: 1,
    borderColor: "#64748b",
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
  },
  createButton: {
    flex: 1,
    backgroundColor: "#10b981",
  },
});
