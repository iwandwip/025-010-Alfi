import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  getActiveTimeline,
  getPaymentsByPeriod,
  updatePaymentStatus,
} from "../../services/timelineService";

export default function PaymentManager() {
  const { timelineId } = useLocalSearchParams();
  const [timeline, setTimeline] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadTimeline = async () => {
    const result = await getActiveTimeline();
    if (result.success) {
      setTimeline(result.timeline);
      const firstActivePeriod = Object.keys(result.timeline.periods).find(
        (key) => result.timeline.periods[key].active
      );
      if (firstActivePeriod) {
        setSelectedPeriod(firstActivePeriod);
      }
    }
    setLoading(false);
  };

  const loadPayments = async (periodKey, isRefresh = false) => {
    if (!periodKey || !timeline) return;

    if (!isRefresh) setLoading(true);
    const result = await getPaymentsByPeriod(timeline.id, periodKey);
    if (result.success) {
      setPayments(result.payments);
    }
    if (!isRefresh) setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments(selectedPeriod, true);
    setRefreshing(false);
  };

  useEffect(() => {
    loadTimeline();
  }, []);

  useEffect(() => {
    if (selectedPeriod && timeline) {
      loadPayments(selectedPeriod);
    }
  }, [selectedPeriod, timeline]);

  const handlePeriodSelect = (periodKey) => {
    setSelectedPeriod(periodKey);
  };

  const handlePaymentUpdate = async (
    payment,
    newStatus,
    paymentMethod = null
  ) => {
    setUpdating(true);

    const updateData = {
      status: newStatus,
      paymentDate: newStatus === "lunas" ? new Date().toISOString() : null,
      paymentMethod: paymentMethod,
    };

    const result = await updatePaymentStatus(
      timeline.id,
      selectedPeriod,
      payment.santriId,
      updateData
    );

    if (result.success) {
      await loadPayments(selectedPeriod, true);
      Alert.alert("Berhasil", "Status pembayaran berhasil diperbarui!");
    } else {
      Alert.alert("Error", result.error);
    }

    setUpdating(false);
  };

  const handleMarkAsPaid = (payment) => {
    Alert.alert(
      "Tandai Lunas",
      `Tandai pembayaran ${payment.santriName} sebagai lunas?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Tunai",
          onPress: () => handlePaymentUpdate(payment, "lunas", "tunai"),
        },
        {
          text: "Online",
          onPress: () => handlePaymentUpdate(payment, "lunas", "online"),
        },
      ]
    );
  };

  const handleMarkAsUnpaid = (payment) => {
    Alert.alert(
      "Tandai Belum Bayar",
      `Tandai pembayaran ${payment.santriName} sebagai belum bayar?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya",
          onPress: () => handlePaymentUpdate(payment, "belum_bayar"),
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "lunas":
        return "#10b981";
      case "belum_bayar":
        return "#ef4444";
      case "terlambat":
        return "#f59e0b";
      default:
        return "#64748b";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "lunas":
        return "Lunas";
      case "belum_bayar":
        return "Belum Bayar";
      case "terlambat":
        return "Terlambat";
      default:
        return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID");
  };

  const renderPeriodTabs = () => {
    if (!timeline) return null;

    return (
      <View style={styles.periodTabs}>
        <FlatList
          horizontal
          data={Object.keys(timeline.periods)}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: periodKey }) => {
            const period = timeline.periods[periodKey];
            if (!period.active) return null;

            return (
              <TouchableOpacity
                style={[
                  styles.periodTab,
                  selectedPeriod === periodKey && styles.periodTabActive,
                ]}
                onPress={() => handlePeriodSelect(periodKey)}
              >
                <Text
                  style={[
                    styles.periodTabText,
                    selectedPeriod === periodKey && styles.periodTabTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  const renderPaymentItem = ({ item }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.santriInfo}>
          <Text style={styles.santriName}>{item.santriName}</Text>
          <Text style={styles.waliName}>Wali: {item.waliName}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Nominal:</Text>
          <Text style={styles.detailValue}>{formatCurrency(item.amount)}</Text>
        </View>

        {item.paymentDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tanggal Bayar:</Text>
            <Text style={styles.detailValue}>
              {formatDate(item.paymentDate)}
            </Text>
          </View>
        )}

        {item.paymentMethod && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Metode:</Text>
            <Text style={styles.detailValue}>{item.paymentMethod}</Text>
          </View>
        )}
      </View>

      <View style={styles.paymentActions}>
        {item.status === "lunas" ? (
          <Button
            title="Tandai Belum Bayar"
            onPress={() => handleMarkAsUnpaid(item)}
            variant="outline"
            style={styles.actionButton}
            disabled={updating}
          />
        ) : (
          <Button
            title="Tandai Lunas"
            onPress={() => handleMarkAsPaid(item)}
            style={styles.actionButton}
            disabled={updating}
          />
        )}
      </View>
    </View>
  );

  const getPaymentSummary = () => {
    const total = payments.length;
    const lunas = payments.filter((p) => p.status === "lunas").length;
    const belumBayar = total - lunas;

    return { total, lunas, belumBayar };
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
          <Text style={styles.headerTitle}>Kelola Pembayaran</Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner text="Memuat data pembayaran..." />
        </View>
      </SafeAreaView>
    );
  }

  const summary = getPaymentSummary();
  const selectedPeriodData = timeline?.periods[selectedPeriod];

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Pembayaran</Text>
      </View>

      {timeline && (
        <View style={styles.timelineInfo}>
          <Text style={styles.timelineName}>{timeline.name}</Text>
          {selectedPeriodData && (
            <Text style={styles.periodInfo}>
              {selectedPeriodData.label} -{" "}
              {formatCurrency(selectedPeriodData.amount)}
            </Text>
          )}
        </View>
      )}

      {renderPeriodTabs()}

      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ringkasan Pembayaran</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{summary.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#10b981" }]}>
                {summary.lunas}
              </Text>
              <Text style={styles.statLabel}>Lunas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#ef4444" }]}>
                {summary.belumBayar}
              </Text>
              <Text style={styles.statLabel}>Belum Bayar</Text>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id}
        style={styles.paymentsList}
        contentContainerStyle={styles.paymentsListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3b82f6"]}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada data pembayaran</Text>
            <Text style={styles.emptySubtext}>
              Generate pembayaran terlebih dahulu
            </Text>
          </View>
        }
      />
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
  timelineInfo: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  timelineName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 4,
  },
  periodInfo: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  periodTabs: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  periodTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  periodTabActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  periodTabText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  periodTabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  summarySection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  paymentsList: {
    flex: 1,
  },
  paymentsListContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  paymentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  santriInfo: {
    flex: 1,
  },
  santriName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  waliName: {
    fontSize: 14,
    color: "#64748b",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  paymentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "600",
  },
  paymentActions: {
    marginTop: 8,
  },
  actionButton: {
    minHeight: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
});
