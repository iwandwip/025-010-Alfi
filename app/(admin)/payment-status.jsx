import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  AppState,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useSettings } from "../../contexts/SettingsContext";
import { useNotification } from "../../contexts/NotificationContext";
import { getColors } from "../../constants/Colors";
import { formatDate } from "../../utils/dateUtils";
import { paymentStatusManager } from "../../services/paymentStatusManager";
import { getAllUsersPaymentStatus } from "../../services/adminPaymentService";

function PaymentStatus() {
  const { theme, loading: settingsLoading } = useSettings();
  const { showUpdateNotification, showErrorNotification } = useNotification();
  const colors = getColors(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState([]);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async (isRefresh = false, useCache = true) => {
    try {
      if (!isRefresh) setLoading(true);

      const result = await paymentStatusManager.updateAllUsersPaymentStatus(
        !useCache,
        isRefresh ? "manual_refresh" : "page_load"
      );

      if (result.success && result.data) {
        setUsers(result.data.users || []);
        setTimeline(result.data.timeline);
      } else {
        const fallbackResult = await getAllUsersPaymentStatus();
        if (fallbackResult.success) {
          setUsers(fallbackResult.users);
          setTimeline(fallbackResult.timeline);
        } else {
          setUsers([]);
          setTimeline(null);
        }
      }
    } catch (error) {
      console.error("Error loading payment status:", error);
      setUsers([]);
      setTimeline(null);
    } finally {
      setLoading(false);
    }
  }, []);

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
      paymentStatusManager.handlePageNavigation("admin-payment-status");
    }, [])
  );

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      paymentStatusManager.handleAppStateChange(nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    const unsubscribe = paymentStatusManager.addListener((type, data) => {
      if (type === "all_users_updated") {
        if (data.data.success) {
          setUsers(data.data.users || []);
          setTimeline(data.data.timeline);
        }
      }
    });

    return unsubscribe;
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }
    return users.filter(
      (user) =>
        user.namaSantri?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.namaWali?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  const handleUserPress = useCallback(
    (user) => {
      router.push({
        pathname: "/(admin)/user-payment-detail",
        params: {
          userId: user.id,
          userName: user.namaSantri || "Santri",
          timelineId: timeline?.id,
        },
      });
    },
    [router, timeline?.id]
  );

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);


  const getStatusColor = useCallback(
    (percentage) => {
      if (percentage === 100) return colors.success;
      if (percentage >= 70) return colors.warning;
      return colors.error;
    },
    [colors]
  );

  const getStatusText = useCallback((summary) => {
    if (summary.progressPercentage === 100) return "Lunas Semua";
    if (summary.belumBayar > 0 && summary.terlambat > 0) return "Ada Tunggakan";
    if (summary.belumBayar > 0) return "Belum Bayar";
    if (summary.terlambat > 0) return "Terlambat";
    return "Sebagian Lunas";
  }, []);

  const renderUserItem = useCallback(
    ({ item: user }) => (
      <TouchableOpacity
        style={[
          styles.userCard,
          { backgroundColor: colors.white, borderColor: colors.gray200 },
        ]}
        onPress={() => handleUserPress(user)}
        activeOpacity={0.7}
      >
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.gray900 }]}>
              {user.namaSantri || "Nama Santri"}
            </Text>
            <Text style={[styles.parentName, { color: colors.gray600 }]}>
              Wali: {user.namaWali || "Nama Wali"}
            </Text>
            <Text style={[styles.userEmail, { color: colors.gray500 }]}>
              {user.email}
            </Text>
          </View>

          <View style={styles.statusBadge}>
            <View
              style={[
                styles.progressCircle,
                {
                  borderColor: getStatusColor(
                    user.paymentSummary.progressPercentage
                  ),
                },
              ]}
            >
              <Text
                style={[
                  styles.progressText,
                  {
                    color: getStatusColor(
                      user.paymentSummary.progressPercentage
                    ),
                  },
                ]}
              >
                {user.paymentSummary.progressPercentage}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.paymentSummary}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.success }]}>
                {user.paymentSummary.lunas}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.gray600 }]}>
                Lunas
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.error }]}>
                {user.paymentSummary.belumBayar}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.gray600 }]}>
                Belum
              </Text>
            </View>

            {user.paymentSummary.terlambat > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: colors.warning }]}>
                  {user.paymentSummary.terlambat}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.gray600 }]}>
                  Terlambat
                </Text>
              </View>
            )}

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.gray900 }]}>
                {user.paymentSummary.total}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.gray600 }]}>
                Total
              </Text>
            </View>
          </View>

          <View style={styles.amountInfo}>
            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: colors.gray600 }]}>
                Sudah Dibayar:
              </Text>
              <Text style={[styles.amountValue, { color: colors.success }]}>
                {formatCurrency(user.paymentSummary.paidAmount)}
              </Text>
            </View>

            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: colors.gray600 }]}>
                Belum Dibayar:
              </Text>
              <Text style={[styles.amountValue, { color: colors.error }]}>
                {formatCurrency(user.paymentSummary.unpaidAmount)}
              </Text>
            </View>
          </View>

          {user.paymentSummary.lastPaymentDate && (
            <View style={styles.lastPayment}>
              <Text style={[styles.lastPaymentText, { color: colors.gray500 }]}>
                Terakhir bayar:{" "}
                {formatDate(user.paymentSummary.lastPaymentDate)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(user.paymentSummary.progressPercentage) },
            ]}
          >
            {getStatusText(user.paymentSummary)}
          </Text>
          <Text style={[styles.arrowText, { color: colors.gray400 }]}>→</Text>
        </View>
      </TouchableOpacity>
    ),
    [
      colors,
      handleUserPress,
      getStatusColor,
      getStatusText,
      formatCurrency,
      formatDate,
    ]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyIcon, { color: colors.gray400 }]}>👥</Text>
        <Text style={[styles.emptyText, { color: colors.gray600 }]}>
          {timeline ? "Belum ada data santri" : "Belum ada timeline aktif"}
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.gray500 }]}>
          {timeline
            ? "Data santri akan muncul setelah ada yang mendaftar"
            : "Buat timeline terlebih dahulu"}
        </Text>
      </View>
    ),
    [colors, timeline]
  );

  const renderLoadingState = useCallback(
    () => (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.gray600 }]}>
          Memuat data pembayaran santri...
        </Text>
      </View>
    ),
    [colors]
  );

  const keyExtractor = useCallback((item) => item.id, []);

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              ← Kembali
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.gray900 }]}>
            Status Pembayaran Santri
          </Text>
        </View>
        {renderLoadingState()}
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            ← Kembali
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.gray900 }]}>
          Status Pembayaran Santri
        </Text>
        {timeline && (
          <Text style={[styles.subtitle, { color: colors.gray600 }]}>
            Timeline: {timeline.name}
          </Text>
        )}
      </View>

      {timeline && (
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.white,
              borderBottomColor: colors.gray200,
            },
          ]}
        >
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.white,
                borderColor: colors.gray300,
                color: colors.gray900,
              },
            ]}
            placeholder="Cari nama santri, wali, atau email..."
            placeholderTextColor={colors.gray500}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {filteredUsers.length > 0 ? (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
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
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={12}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 200,
            offset: 200 * index,
            index,
          })}
        />
      ) : (
        renderEmptyState()
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
    fontSize: 14,
    textAlign: "center",
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  listContent: {
    padding: 24,
  },
  userCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
    marginRight: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  parentName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
  },
  statusBadge: {
    alignItems: "center",
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  paymentSummary: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  amountInfo: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  lastPayment: {
    marginTop: 8,
  },
  lastPaymentText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  arrowText: {
    fontSize: 18,
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
});

export default PaymentStatus;
