import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  AppState,
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
  Searchbar,
  Divider
} from "react-native-paper";
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

function PaymentStatus() {
  const { theme, loading: settingsLoading } = useSettings();
  const { showUpdateNotification, showErrorNotification } = useNotification();
  const colors = getColors(theme);
  const paperTheme = useTheme();
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
    if (summary.belumBayar > 0 && summary.terlambat > 0) return "Ada Tunggakan";
    if (summary.belumBayar > 0) return "Belum Bayar";
    if (summary.terlambat > 0) return "Terlambat";
    return "Sebagian Lunas";
  }, []);

  const renderUserItem = useCallback(
    ({ item: user, index }) => (
      <Animated.View entering={SlideInRight.delay(index * 100)}>
        <Card 
          style={styles.userCard} 
          mode="outlined" 
          onPress={() => handleUserPress(user)}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.userHeader}>
              <View style={styles.avatarSection}>
                <Avatar.Text 
                  size={48} 
                  label={user.namaWarga?.charAt(0)?.toUpperCase() || 'W'}
                  style={{ backgroundColor: paperTheme.colors.primaryContainer }}
                  color={paperTheme.colors.onPrimaryContainer}
                />
              </View>
              
              <View style={styles.userInfo}>
                <Text variant="titleMedium" style={[styles.userName, { fontWeight: '600', marginBottom: 4 }]}>
                  {user.namaWarga || "Nama Warga"}
                </Text>
                <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant, fontStyle: 'italic' }}>
                  {user.email}
                </Text>
                <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                  Progress: {user.paymentSummary.progressPercentage}%
                </Text>
              </View>

              <View style={styles.statusSection}>
                <Chip 
                  icon={user.paymentSummary.progressPercentage === 100 ? "check-circle" : user.paymentSummary.progressPercentage >= 70 ? "alert-circle" : "close-circle"}
                  mode="flat"
                  style={{ 
                    backgroundColor: user.paymentSummary.progressPercentage === 100 ? paperTheme.colors.successContainer : user.paymentSummary.progressPercentage >= 70 ? paperTheme.colors.warningContainer : paperTheme.colors.errorContainer,
                    marginBottom: 8
                  }}
                  textStyle={{ 
                    color: user.paymentSummary.progressPercentage === 100 ? paperTheme.colors.onSuccessContainer : user.paymentSummary.progressPercentage >= 70 ? paperTheme.colors.onWarningContainer : paperTheme.colors.onErrorContainer,
                    fontSize: 11
                  }}
                >
                  {getStatusText(user.paymentSummary)}
                </Chip>
                <IconButton 
                  icon="chevron-right" 
                  size={20}
                  iconColor={paperTheme.colors.onSurfaceVariant}
                />
              </View>
            </View>

            <Divider style={{ marginVertical: 12 }} />

            <View style={styles.paymentSummary}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text variant="titleMedium" style={{ color: paperTheme.colors.success, fontWeight: 'bold' }}>
                    {user.paymentSummary.lunas}
                  </Text>
                  <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    Lunas
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text variant="titleMedium" style={{ color: paperTheme.colors.error, fontWeight: 'bold' }}>
                    {user.paymentSummary.belumBayar}
                  </Text>
                  <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    Belum
                  </Text>
                </View>

                {user.paymentSummary.belumLunas > 0 && (
                  <View style={styles.summaryItem}>
                    <Text variant="titleMedium" style={{ color: paperTheme.colors.tertiary, fontWeight: 'bold' }}>
                      {user.paymentSummary.belumLunas}
                    </Text>
                    <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      Parsial
                    </Text>
                  </View>
                )}

                {user.paymentSummary.terlambat > 0 && (
                  <View style={styles.summaryItem}>
                    <Text variant="titleMedium" style={{ color: paperTheme.colors.warning, fontWeight: 'bold' }}>
                      {user.paymentSummary.terlambat}
                    </Text>
                    <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      Terlambat
                    </Text>
                  </View>
                )}

                <View style={styles.summaryItem}>
                  <Text variant="titleMedium" style={{ color: paperTheme.colors.onSurface, fontWeight: 'bold' }}>
                    {user.paymentSummary.total}
                  </Text>
                  <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    Total
                  </Text>
                </View>
              </View>

              <View style={styles.amountInfo}>
                <View style={styles.amountRow}>
                  <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    Sudah Dibayar:
                  </Text>
                  <Text variant="bodyMedium" style={{ color: paperTheme.colors.success, fontWeight: '600' }}>
                    {formatCurrency(user.paymentSummary.paidAmount)}
                  </Text>
                </View>

                {user.paymentSummary.partialAmount > 0 && (
                  <View style={styles.amountRow}>
                    <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      Terbayar Parsial:
                    </Text>
                    <Text variant="bodyMedium" style={{ color: paperTheme.colors.tertiary, fontWeight: '600' }}>
                      {formatCurrency(user.paymentSummary.partialAmount)}
                    </Text>
                  </View>
                )}

                <View style={styles.amountRow}>
                  <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    Belum Dibayar:
                  </Text>
                  <Text variant="bodyMedium" style={{ color: paperTheme.colors.error, fontWeight: '600' }}>
                    {formatCurrency(user.paymentSummary.unpaidAmount)}
                  </Text>
                </View>
              </View>

              {user.paymentSummary.lastPaymentDate && (
                <View style={styles.lastPayment}>
                  <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant, fontStyle: 'italic' }}>
                    Terakhir bayar: {formatDate(user.paymentSummary.lastPaymentDate)}
                  </Text>
                </View>
              )}
            </View>

          </Card.Content>
        </Card>
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
        <Avatar.Icon 
          size={80} 
          icon={timeline ? "account-off" : "calendar-blank"} 
          style={{ backgroundColor: paperTheme.colors.surfaceVariant }}
          color={paperTheme.colors.onSurfaceVariant}
        />
        <Text variant="headlineSmall" style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant, marginTop: 16, marginBottom: 8, fontWeight: '600' }]}>
          {timeline ? "Belum ada data warga" : "Belum ada timeline aktif"}
        </Text>
        <Text variant="bodyMedium" style={[styles.emptySubtext, { color: paperTheme.colors.onSurfaceVariant, textAlign: 'center' }]}>
          {timeline
            ? "Data warga akan muncul setelah ada yang mendaftar"
            : "Buat timeline terlebih dahulu"}
        </Text>
      </Animated.View>
    ),
    [paperTheme, timeline]
  );

  const renderLoadingState = useCallback(
    () => (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" animating />
        <Text variant="bodyLarge" style={{ marginTop: 16 }}>
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
            Status Pembayaran Warga
          </Text>
          <View style={styles.placeholder} />
        </Surface>
        {renderLoadingState()}
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
          Status Pembayaran Warga
        </Text>
        <View style={styles.placeholder} />
      </Surface>

      <View style={styles.content}>
        {/* Summary Card */}
        {timeline && (
          <Animated.View entering={FadeInDown.delay(100)}>
            <Card style={styles.summaryCard} mode="elevated">
              <Card.Content>
                <View style={styles.summaryHeader}>
                  <Avatar.Icon 
                    size={48} 
                    icon="chart-line" 
                    style={{ backgroundColor: paperTheme.colors.primary }}
                    color={paperTheme.colors.onPrimary}
                  />
                  <View style={styles.summaryInfo}>
                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                      {filteredUsers.length}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      Total Warga
                    </Text>
                  </View>
                  <View style={styles.summaryInfo}>
                    <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      Timeline: {timeline.name}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        )}

        {timeline && (
          <View style={styles.searchContainer}>
            <Searchbar
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
                colors={[paperTheme.colors.primary]}
                tintColor={paperTheme.colors.primary}
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
});

export default PaymentStatus;
