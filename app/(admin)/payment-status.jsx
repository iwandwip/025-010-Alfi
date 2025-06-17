import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  AppState,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useSettings } from "../../contexts/SettingsContext";
import { useNotification } from "../../contexts/NotificationContext";
import { getColors } from "../../constants/Colors";
import { formatDate } from "../../utils/dateUtils";
import { paymentStatusManager } from "../../services/paymentStatusManager";
import { getAllUsersPaymentStatus } from "../../services/adminPaymentService";
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';

function PaymentStatus() {
  const { theme, loading: settingsLoading } = useSettings();
  const { showUpdateNotification, showErrorNotification } = useNotification();
  const colors = getColors(theme);
  // Using custom theme from constants
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
  }, [settingsLoading]); // loadData is stable due to useCallback with empty deps

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
        user.namaWarga?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  const handleUserPress = useCallback(
    (user) => {
      router.push({
        pathname: "/(admin)/user-payment-detail",
        params: {
          userId: user.id,
          userName: user.namaWarga || "Warga",
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
    if (summary.belumLunas > 0) return "Ada Terbayar Parsial";
    if (summary.belumBayar > 0 && summary.terlambat > 0) return "Ada Tunggakan";
    if (summary.belumBayar > 0) return "Belum Bayar";
    if (summary.terlambat > 0) return "Terlambat";
    return "Sebagian Lunas";
  }, []);

  const renderUserItem = useCallback(
    ({ item: user, index }) => (
      <Animated.View entering={SlideInRight.delay(index * 100)}>
        <TouchableOpacity 
          style={[styles.userCard, { backgroundColor: Colors.surface }, Shadows.sm]} 
          onPress={() => handleUserPress(user)}
        >
          <View style={styles.cardContent}>
            <View style={styles.userHeader}>
              <View style={styles.avatarSection}>
                <View style={[styles.avatarCircle, { backgroundColor: Colors.primaryContainer }]}>
                  <Text style={[styles.avatarText, { color: Colors.onPrimaryContainer }]}>
                    {user.namaWarga?.charAt(0)?.toUpperCase() || 'W'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.userInfo}>
                <Text style="titleMedium" style={[styles.userName, { fontWeight: '600', marginBottom: 4 }]}>
                  {user.namaWarga || "Nama Warga"}
                </Text>
                <Text style="bodySmall" style={{ color: Colors.onViewVariant, fontStyle: 'italic' }}>
                  {user.email}
                </Text>
                <Text style="bodySmall" style={{ color: Colors.onViewVariant }}>
                  Progress: {user.paymentSummary.progressPercentage}%
                </Text>
              </View>

              <View style={styles.statusSection}>
                <View style={[
                  styles.statusChip,
                  { 
                    backgroundColor: user.paymentSummary.progressPercentage === 100 ? Colors.successContainer : user.paymentSummary.belumLunas > 0 ? Colors.tertiaryContainer : user.paymentSummary.progressPercentage >= 70 ? Colors.warningContainer : Colors.errorContainer,
                    marginBottom: 8
                  }
                ]}>
                  <MaterialIcons 
                    name={user.paymentSummary.progressPercentage === 100 ? "check-circle" : user.paymentSummary.belumLunas > 0 ? "schedule" : user.paymentSummary.progressPercentage >= 70 ? "warning" : "cancel"}
                    size={12}
                    color={user.paymentSummary.progressPercentage === 100 ? Colors.onSuccessContainer : user.paymentSummary.belumLunas > 0 ? Colors.onTertiaryContainer : user.paymentSummary.progressPercentage >= 70 ? Colors.onWarningContainer : Colors.onErrorContainer}
                  />
                  <Text style={[
                    styles.statusText,
                    { 
                      color: user.paymentSummary.progressPercentage === 100 ? Colors.onSuccessContainer : user.paymentSummary.belumLunas > 0 ? Colors.onTertiaryContainer : user.paymentSummary.progressPercentage >= 70 ? Colors.onWarningContainer : Colors.onErrorContainer
                    }
                  ]}>
                    {getStatusText(user.paymentSummary)}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={Colors.onViewVariant} />
              </View>
            </View>

            <View style={{ marginVertical: 12 }} />

            <View style={styles.paymentSummary}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style="titleMedium" style={{ color: Colors.success, fontWeight: 'bold' }}>
                    {user.paymentSummary.lunas}
                  </Text>
                  <Text style="bodySmall" style={{ color: Colors.onViewVariant }}>
                    Lunas
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style="titleMedium" style={{ color: Colors.error, fontWeight: 'bold' }}>
                    {user.paymentSummary.belumBayar}
                  </Text>
                  <Text style="bodySmall" style={{ color: Colors.onViewVariant }}>
                    Belum
                  </Text>
                </View>

                {user.paymentSummary.belumLunas > 0 && (
                  <View style={styles.summaryItem}>
                    <Text style="titleMedium" style={{ color: Colors.tertiary, fontWeight: 'bold' }}>
                      {user.paymentSummary.belumLunas}
                    </Text>
                    <Text style="bodySmall" style={{ color: Colors.onViewVariant }}>
                      Parsial
                    </Text>
                  </View>
                )}

                {user.paymentSummary.terlambat > 0 && (
                  <View style={styles.summaryItem}>
                    <Text style="titleMedium" style={{ color: Colors.warning, fontWeight: 'bold' }}>
                      {user.paymentSummary.terlambat}
                    </Text>
                    <Text style="bodySmall" style={{ color: Colors.onViewVariant }}>
                      Terlambat
                    </Text>
                  </View>
                )}

                <View style={styles.summaryItem}>
                  <Text style="titleMedium" style={{ color: Colors.onView, fontWeight: 'bold' }}>
                    {user.paymentSummary.total}
                  </Text>
                  <Text style="bodySmall" style={{ color: Colors.onViewVariant }}>
                    Total
                  </Text>
                </View>
              </View>

              <View style={styles.amountInfo}>
                <View style={styles.amountRow}>
                  <Text style="bodyMedium" style={{ color: Colors.onViewVariant }}>
                    Sudah Dibayar:
                  </Text>
                  <Text style="bodyMedium" style={{ color: Colors.success, fontWeight: '600' }}>
                    {formatCurrency(user.paymentSummary.paidAmount)}
                  </Text>
                </View>

                {user.paymentSummary.partialAmount > 0 && (
                  <View style={styles.amountRow}>
                    <Text style="bodyMedium" style={{ color: Colors.onViewVariant }}>
                      Terbayar Parsial:
                    </Text>
                    <Text style="bodyMedium" style={{ color: Colors.tertiary, fontWeight: '600' }}>
                      {formatCurrency(user.paymentSummary.partialAmount)}
                    </Text>
                  </View>
                )}

                <View style={styles.amountRow}>
                  <Text style="bodyMedium" style={{ color: Colors.onViewVariant }}>
                    Belum Dibayar:
                  </Text>
                  <Text style="bodyMedium" style={{ color: Colors.error, fontWeight: '600' }}>
                    {formatCurrency(user.paymentSummary.unpaidAmount)}
                  </Text>
                </View>
              </View>

              {user.paymentSummary.lastPaymentDate && (
                <View style={styles.lastPayment}>
                  <Text style="bodySmall" style={{ color: Colors.onViewVariant, fontStyle: 'italic' }}>
                    Terakhir bayar: {formatDate(user.paymentSummary.lastPaymentDate)}
                  </Text>
                </View>
              )}
            </View>

          </View>
        </TouchableOpacity>
      </Animated.View>
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
      <Animated.View entering={FadeInDown.delay(200)} style={styles.emptyContainer}>
        <View style={[styles.emptyIcon, { backgroundColor: Colors.surfaceVariant }]}>
          <MaterialIcons 
            name={timeline ? "person-off" : "event"} 
            size={80} 
            color={Colors.onViewVariant} 
          />
        </View>
        <Text style="headlineSmall" style={[styles.emptyText, { color: Colors.onViewVariant, marginTop: 16, marginBottom: 8, fontWeight: '600' }]}>
          {timeline ? "Belum ada data warga" : "Belum ada timeline aktif"}
        </Text>
        <Text style="bodyMedium" style={[styles.emptySubtext, { color: Colors.onViewVariant, textAlign: 'center' }]}>
          {timeline
            ? "Data warga akan muncul setelah ada yang mendaftar"
            : "Buat timeline terlebih dahulu"}
        </Text>
      </Animated.View>
    ),
    [timeline]
  );

  const renderLoadingState = useCallback(
    () => (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" animating />
        <Text style="bodyLarge" style={{ marginTop: 16 }}>
          Memuat data setoran warga...
        </Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item) => item.id, []);

  if (settingsLoading || loading) {
    return (
      <LinearGradient
        colors={[Colors.primaryContainer, Colors.background]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={[styles.header, Shadows.md, { backgroundColor: Colors.surface }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style="headlineMedium" style={styles.headerTitle}>
            Status Pembayaran Warga
          </Text>
          <View style={styles.placeholder} />
        </View>
        {renderLoadingState()}
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.primaryContainer, Colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header} ...Shadows.md, //elevation=2}>
        <TouchableOpacity
          icon="arrow-left"
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text style="headlineMedium" style={styles.headerTitle}>
          Status Pembayaran Warga
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Summary Card */}
        {timeline && (
          <Animated.View entering={FadeInDown.delay(100)}>
            <View style={[styles.summaryCard, Shadows.md, { backgroundColor: Colors.surface }]}>
              <View style={{ padding: 20 }}>
                <View style={styles.summaryHeader}>
                  <View style={[styles.summaryIcon, { backgroundColor: Colors.primary }]}>
                    <MaterialIcons name="show-chart" size={32} color={Colors.onPrimary} />
                  </View>
                  <View style={styles.summaryInfo}>
                    <Text style="titleLarge" style={{ fontWeight: 'bold' }}>
                      {filteredUsers.length}
                    </Text>
                    <Text style="bodyMedium" style={{ color: Colors.onViewVariant }}>
                      Total Warga
                    </Text>
                  </View>
                  <View style={styles.summaryInfo}>
                    <Text style="bodyMedium" style={{ color: Colors.onViewVariant }}>
                      Timeline: {timeline.name}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {timeline && (
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Cari nama warga atau email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchbar}
            />
          </View>
        )}

        {filteredUsers.length > 0 ? (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={keyExtractor}
            style={styles.list}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary || '#F50057']}
                tintColor={Colors.primary || '#F50057'}
              />
            }
          />
        ) : (
          renderEmptyState()
        )}
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
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    borderRadius: 16,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryInfo: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchbar: {
    borderRadius: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 4,
  },
  userCard: {
    borderRadius: 16,
    marginBottom: 12,
  },
  cardContent: {
    paddingVertical: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarSection: {
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: 4,
  },
  statusSection: {
    alignItems: 'center',
  },
  paymentSummary: {
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  amountInfo: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  lastPayment: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: 'center',
  },
  emptySubtext: {
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PaymentStatus;
