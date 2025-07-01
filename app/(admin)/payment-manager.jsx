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
import { lightTheme } from "../../constants/Colors";
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
      payment.wargaId,
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
      `Tandai pembayaran ${payment.wargaName} sebagai lunas?`,
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
      `Tandai pembayaran ${payment.wargaName} sebagai belum bayar?`,
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

  // Kanban Card Component
  const renderKanbanCard = (item, columnColor) => (
    <View key={item.id} style={[styles.kanbanCard, { borderLeftColor: columnColor }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardWargaName} numberOfLines={1}>
          {item.wargaName}
        </Text>
        <Text style={[styles.cardAmount, { color: columnColor }]}>
          {formatCurrency(item.amount)}
        </Text>
      </View>
      
      <Text style={styles.cardAlamat} numberOfLines={2}>
        📍 {item.alamat}
      </Text>
      
      {item.paymentDate && (
        <Text style={styles.cardPaymentDate}>
          💳 {formatDate(item.paymentDate)}
        </Text>
      )}
      
      {item.paymentMethod && (
        <Text style={styles.cardPaymentMethod}>
          🏦 {item.paymentMethod}
        </Text>
      )}
      
      <View style={styles.cardActions}>
        {item.status === "lunas" ? (
          <TouchableOpacity
            style={[styles.cardActionButton, { backgroundColor: "#fee2e2" }]}
            onPress={() => handleMarkAsUnpaid(item)}
            disabled={updating}
          >
            <Text style={[styles.cardActionText, { color: lightTheme.error }]}>
              ↩️ Batal
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.cardActionButton, { backgroundColor: "#dcfce7" }]}
            onPress={() => handleMarkAsPaid(item)}
            disabled={updating}
          >
            <Text style={[styles.cardActionText, { color: "#16a34a" }]}>
              ✅ Lunas
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Kanban Column Component
  const renderKanbanColumn = (column) => (
    <View key={column.id} style={[styles.kanbanColumn, { backgroundColor: column.bgColor }]}>
      <View style={[styles.columnHeader, { borderBottomColor: column.color }]}>
        <Text style={[styles.columnTitle, { color: column.color }]}>
          {column.title}
        </Text>
        <View style={[styles.columnBadge, { backgroundColor: column.color }]}>
          <Text style={styles.columnBadgeText}>{column.count}</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.columnContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.columnContentContainer}
      >
        {column.payments.length === 0 ? (
          <View style={styles.emptyColumn}>
            <Text style={styles.emptyColumnText}>Tidak ada data</Text>
          </View>
        ) : (
          column.payments.map(payment => renderKanbanCard(payment, column.color))
        )}
      </ScrollView>
    </View>
  );

  const getPaymentSummary = () => {
    const total = payments.length;
    const lunas = payments.filter((p) => p.status === "lunas").length;
    const belumBayar = payments.filter((p) => p.status === "belum_bayar").length;
    const terlambat = payments.filter((p) => p.status === "terlambat").length;

    return { total, lunas, belumBayar, terlambat };
  };

  // Kanban columns data
  const getKanbanColumns = () => {
    const summary = getPaymentSummary();
    return [
      {
        id: "belum_bayar",
        title: "💰 Belum Bayar",
        color: "#ef4444",
        bgColor: "#fef2f2",
        count: summary.belumBayar,
        payments: payments.filter((p) => p.status === "belum_bayar"),
      },
      {
        id: "terlambat",
        title: "⏰ Terlambat",
        color: "#f59e0b",
        bgColor: "#fffbeb",
        count: summary.terlambat,
        payments: payments.filter((p) => p.status === "terlambat"),
      },
      {
        id: "lunas",
        title: "✅ Lunas",
        color: "#10b981",
        bgColor: "#ecfdf5",
        count: summary.lunas,
        payments: payments.filter((p) => p.status === "lunas"),
      },
    ];
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎯 Kanban Payment Manager</Text>
      </View>

      {/* Timeline Info */}
      {timeline && (
        <View style={styles.timelineInfo}>
          <Text style={styles.timelineName}>📋 {timeline.name}</Text>
          {selectedPeriodData && (
            <Text style={styles.periodInfo}>
              🗓️ {selectedPeriodData.label} • {formatCurrency(selectedPeriodData.amount)}
            </Text>
          )}
        </View>
      )}

      {/* Period Tabs */}
      {renderPeriodTabs()}

      {/* Kanban Summary Stats */}
      <View style={styles.kanbanSummary}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getKanbanColumns().map((column) => (
            <View key={column.id} style={[styles.summaryStatCard, { borderColor: column.color }]}>
              <View style={[styles.summaryStatIcon, { backgroundColor: column.color }]}>
                <Text style={styles.summaryStatIconText}>
                  {column.id === "belum_bayar" ? "💰" : column.id === "terlambat" ? "⏰" : "✅"}
                </Text>
              </View>
              <Text style={[styles.summaryStatNumber, { color: column.color }]}>
                {column.count}
              </Text>
              <Text style={styles.summaryStatLabel}>
                {column.title.replace(/[💰⏰✅]/g, '').trim()}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Kanban Board */}
      <ScrollView 
        horizontal 
        style={styles.kanbanBoard}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kanbanBoardContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[lightTheme.primary]}
            tintColor={lightTheme.primary}
          />
        }
      >
        {payments.length === 0 ? (
          <View style={styles.emptyKanban}>
            <Text style={styles.emptyKanbanTitle}>📭 Tidak Ada Data</Text>
            <Text style={styles.emptyKanbanText}>
              Generate pembayaran terlebih dahulu untuk melihat kanban board
            </Text>
          </View>
        ) : (
          getKanbanColumns().map(renderKanbanColumn)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: lightTheme.primary,
    backgroundColor: "#fff",
    shadowColor: lightTheme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#e6f3ff",
  },
  backButtonText: {
    fontSize: 16,
    color: lightTheme.primary,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: lightTheme.primary,
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
    borderBottomColor: "#e6f3ff",
  },
  timelineName: {
    fontSize: 20,
    fontWeight: "700",
    color: lightTheme.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  periodInfo: {
    fontSize: 14,
    color: "#4a5568",
    textAlign: "center",
    fontWeight: "500",
  },
  periodTabs: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e6f3ff",
  },
  periodTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#f8fbff",
    borderWidth: 2,
    borderColor: "#e6f3ff",
  },
  periodTabActive: {
    backgroundColor: lightTheme.primary,
    borderColor: lightTheme.primary,
  },
  periodTabText: {
    fontSize: 12,
    color: "#4a5568",
    fontWeight: "600",
  },
  periodTabTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  // Kanban Summary Styles
  kanbanSummary: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e6f3ff",
  },
  summaryStatCard: {
    backgroundColor: "#f8fbff",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: "center",
    minWidth: 100,
    borderWidth: 2,
  },
  summaryStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  summaryStatIconText: {
    fontSize: 16,
  },
  summaryStatNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: "#4a5568",
    fontWeight: "500",
    textAlign: "center",
  },
  // Kanban Board Styles
  kanbanBoard: {
    flex: 1,
    paddingTop: 16,
  },
  kanbanBoardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  // Kanban Column Styles
  kanbanColumn: {
    width: 280,
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e6f3ff",
    maxHeight: 600,
  },
  columnHeader: {
    padding: 16,
    borderBottomWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  columnBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  columnBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  columnContent: {
    flex: 1,
  },
  columnContentContainer: {
    padding: 12,
  },
  // Kanban Card Styles
  kanbanCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardWargaName: {
    fontSize: 14,
    fontWeight: "700",
    color: lightTheme.primary,
    flex: 1,
    marginRight: 8,
  },
  cardAmount: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardAlamat: {
    fontSize: 11,
    color: "#4a5568",
    marginBottom: 6,
    lineHeight: 14,
  },
  cardPaymentDate: {
    fontSize: 10,
    color: "#059669",
    marginBottom: 4,
  },
  cardPaymentMethod: {
    fontSize: 10,
    color: "#7c3aed",
    marginBottom: 8,
  },
  cardActions: {
    alignItems: "center",
  },
  cardActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 80,
  },
  cardActionText: {
    fontSize: 11,
    fontWeight: "600",
  },
  // Empty States
  emptyColumn: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyColumnText: {
    fontSize: 12,
    color: "#7a8394",
    fontStyle: "italic",
  },
  emptyKanban: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
    minWidth: 300,
  },
  emptyKanbanTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: lightTheme.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyKanbanText: {
    fontSize: 14,
    color: "#4a5568",
    textAlign: "center",
    lineHeight: 20,
  },
});

