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
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useSettings } from "../../contexts/SettingsContext";
import { useNotification } from "../../contexts/NotificationContext";
import { lightTheme } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import { formatDate } from "../../utils/dateUtils";
import { paymentStatusManager } from "../../services/paymentStatusManager";
import { getAllUsersPaymentStatus } from "../../services/adminPaymentService";

const { width: screenWidth } = Dimensions.get('window');

function PaymentStatus() {
  const { theme, loading: settingsLoading } = useSettings();
  const { showUpdateNotification, showErrorNotification } = useNotification();
  const { userProfile } = useAuth();
  const colors = lightTheme; // Consistent theme
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState([]);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

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

  // Dashboard statistics
  const dashboardStats = useMemo(() => {
    if (!users.length) {
      return {
        totalUsers: 0,
        totalLunas: 0,
        totalBelumBayar: 0,
        totalTerlambat: 0,
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        progressPercentage: 0,
      };
    }

    let totalLunas = 0;
    let totalBelumBayar = 0;
    let totalTerlambat = 0;
    let totalAmount = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;

    users.forEach((user) => {
      totalLunas += user.paymentSummary.lunas;
      totalBelumBayar += user.paymentSummary.belumBayar;
      totalTerlambat += user.paymentSummary.terlambat;
      totalAmount += user.paymentSummary.totalAmount || 0;
      paidAmount += user.paymentSummary.paidAmount || 0;
      unpaidAmount += user.paymentSummary.unpaidAmount || 0;
    });

    const progressPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

    return {
      totalUsers: users.length,
      totalLunas,
      totalBelumBayar,
      totalTerlambat,
      totalAmount,
      paidAmount,
      unpaidAmount,
      progressPercentage,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply status filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter((user) => {
        const summary = user.paymentSummary;
        switch (selectedFilter) {
          case "lunas":
            return summary.progressPercentage === 100;
          case "belum":
            return summary.belumBayar > 0 && summary.terlambat === 0;
          case "terlambat":
            return summary.terlambat > 0;
          case "sebagian":
            return summary.progressPercentage > 0 && summary.progressPercentage < 100;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.namaWarga?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.alamat?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery, users, selectedFilter]);

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

  const colors = lightTheme;

  const renderDashboardCard = useCallback(
    ({ title, value, subtitle, icon, color, onPress }) => (
      <TouchableOpacity
        style={[
          styles.dashboardCard,
          { backgroundColor: colors.white, borderLeftColor: color }
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <Text style={[styles.cardIconText, { color }]}>{icon}</Text>
          </View>
          <View style={styles.cardData}>
            <Text style={[styles.cardValue, { color: colors.gray900 }]}>{value}</Text>
            <Text style={[styles.cardTitle, { color: colors.gray600 }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.cardSubtitle, { color: colors.gray500 }]}>{subtitle}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    ),
    [colors]
  );

  const renderProgressBar = useCallback(
    ({ percentage, color, height = 8 }) => (
      <View style={[styles.progressBarContainer, { height, backgroundColor: colors.gray200 }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              height,
            }
          ]}
        />
      </View>
    ),
    [colors]
  );

  const renderFilterChip = useCallback(
    ({ label, value, count }) => (
      <TouchableOpacity
        style={[
          styles.filterChip,
          {
            backgroundColor: selectedFilter === value ? colors.primary : colors.white,
            borderColor: selectedFilter === value ? colors.primary : colors.gray300,
          }
        ]}
        onPress={() => setSelectedFilter(value)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.filterChipText,
            {
              color: selectedFilter === value ? colors.white : colors.gray700,
            }
          ]}
        >
          {label}
        </Text>
        {count !== undefined && (
          <View style={[
            styles.filterChipBadge,
            {
              backgroundColor: selectedFilter === value ? colors.white : colors.primary,
            }
          ]}>
            <Text
              style={[
                styles.filterChipBadgeText,
                {
                  color: selectedFilter === value ? colors.primary : colors.white,
                }
              ]}
            >
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    ),
    [selectedFilter, colors]
  );

  const renderDashboard = useCallback(
    () => (
      <View style={styles.dashboardContainer}>
        {/* Overview Cards */}
        <View style={styles.overviewSection}>
          <Text style={[styles.sectionTitle, { color: colors.gray900 }]}>
            📊 Ringkasan Pembayaran
          </Text>
          
          <View style={styles.cardsGrid}>
            {renderDashboardCard({
              title: "Total Warga",
              value: dashboardStats.totalUsers.toString(),
              subtitle: "Terdaftar",
              icon: "👥",
              color: colors.primary,
              onPress: () => setSelectedFilter("all"),
            })}
            
            {renderDashboardCard({
              title: "Sudah Lunas",
              value: dashboardStats.totalLunas.toString(),
              subtitle: "Pembayaran",
              icon: "✅",
              color: colors.success,
              onPress: () => setSelectedFilter("lunas"),
            })}
            
            {renderDashboardCard({
              title: "Belum Bayar",
              value: dashboardStats.totalBelumBayar.toString(),
              subtitle: "Pembayaran",
              icon: "⏳",
              color: colors.warning,
              onPress: () => setSelectedFilter("belum"),
            })}
            
            {renderDashboardCard({
              title: "Terlambat",
              value: dashboardStats.totalTerlambat.toString(),
              subtitle: "Pembayaran",
              icon: "⚠️",
              color: colors.error,
              onPress: () => setSelectedFilter("terlambat"),
            })}
          </View>
        </View>

        {/* Financial Summary */}
        <View style={[styles.financialCard, { backgroundColor: colors.white }]}>
          <Text style={[styles.sectionTitle, { color: colors.gray900 }]}>
            💰 Ringkasan Keuangan
          </Text>
          
          <View style={styles.financialStats}>
            <View style={styles.financialRow}>
              <Text style={[styles.financialLabel, { color: colors.gray600 }]}>
                Total yang Harus Dikumpulkan:
              </Text>
              <Text style={[styles.financialValue, { color: colors.gray900 }]}>
                {formatCurrency(dashboardStats.totalAmount)}
              </Text>
            </View>
            
            <View style={styles.financialRow}>
              <Text style={[styles.financialLabel, { color: colors.gray600 }]}>
                Sudah Terkumpul:
              </Text>
              <Text style={[styles.financialValue, { color: colors.success }]}>
                {formatCurrency(dashboardStats.paidAmount)}
              </Text>
            </View>
            
            <View style={styles.financialRow}>
              <Text style={[styles.financialLabel, { color: colors.gray600 }]}>
                Belum Terkumpul:
              </Text>
              <Text style={[styles.financialValue, { color: colors.error }]}>
                {formatCurrency(dashboardStats.unpaidAmount)}
              </Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressTitle, { color: colors.gray700 }]}>
                Progress Keseluruhan
              </Text>
              <Text style={[styles.progressPercentage, { color: colors.primary }]}>
                {dashboardStats.progressPercentage}%
              </Text>
            </View>
            {renderProgressBar({
              percentage: dashboardStats.progressPercentage,
              color: colors.primary,
              height: 12,
            })}
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersSection}>
          <Text style={[styles.sectionTitle, { color: colors.gray900 }]}>
            🔍 Filter Status
          </Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {renderFilterChip({
              label: "Semua",
              value: "all",
              count: dashboardStats.totalUsers,
            })}
            {renderFilterChip({
              label: "Lunas",
              value: "lunas",
              count: users.filter(u => u.paymentSummary.progressPercentage === 100).length,
            })}
            {renderFilterChip({
              label: "Belum Bayar",
              value: "belum",
              count: users.filter(u => u.paymentSummary.belumBayar > 0 && u.paymentSummary.terlambat === 0).length,
            })}
            {renderFilterChip({
              label: "Terlambat",
              value: "terlambat",
              count: users.filter(u => u.paymentSummary.terlambat > 0).length,
            })}
            {renderFilterChip({
              label: "Sebagian",
              value: "sebagian",
              count: users.filter(u => u.paymentSummary.progressPercentage > 0 && u.paymentSummary.progressPercentage < 100).length,
            })}
          </ScrollView>
        </View>
      </View>
    ),
    [dashboardStats, selectedFilter, renderDashboardCard, renderProgressBar, renderFilterChip, formatCurrency, users, colors]
  );

  const renderUserItem = useCallback(
    ({ item: user }) => (
      <View
        style={[
          styles.userCard,
          { backgroundColor: colors.white, borderColor: colors.gray200 },
        ]}
      >
        <TouchableOpacity
          style={styles.userCardContent}
          onPress={() => handleUserPress(user)}
          activeOpacity={0.7}
        >
          <View style={styles.userHeader}>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.gray900 }]}>
                {user.namaWarga || "Nama Warga"}
              </Text>
              <Text style={[styles.parentName, { color: colors.gray600 }]}>
                📍 {user.alamat || "Alamat Warga"}
              </Text>
              <Text style={[styles.userEmail, { color: colors.gray500 }]}>
                ✉️ {user.email}
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
                    backgroundColor: `${getStatusColor(user.paymentSummary.progressPercentage)}10`,
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
                <View style={[styles.summaryBadge, { backgroundColor: `${colors.success}15` }]}>
                  <Text style={[styles.summaryNumber, { color: colors.success }]}>
                    {user.paymentSummary.lunas}
                  </Text>
                </View>
                <Text style={[styles.summaryLabel, { color: colors.gray600 }]}>
                  Lunas
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <View style={[styles.summaryBadge, { backgroundColor: `${colors.warning}15` }]}>
                  <Text style={[styles.summaryNumber, { color: colors.warning }]}>
                    {user.paymentSummary.belumBayar}
                  </Text>
                </View>
                <Text style={[styles.summaryLabel, { color: colors.gray600 }]}>
                  Belum
                </Text>
              </View>

              {user.paymentSummary.terlambat > 0 && (
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryBadge, { backgroundColor: `${colors.error}15` }]}>
                    <Text style={[styles.summaryNumber, { color: colors.error }]}>
                      {user.paymentSummary.terlambat}
                    </Text>
                  </View>
                  <Text style={[styles.summaryLabel, { color: colors.gray600 }]}>
                    Terlambat
                  </Text>
                </View>
              )}

              <View style={styles.summaryItem}>
                <View style={[styles.summaryBadge, { backgroundColor: `${colors.primary}15` }]}>
                  <Text style={[styles.summaryNumber, { color: colors.primary }]}>
                    {user.paymentSummary.total}
                  </Text>
                </View>
                <Text style={[styles.summaryLabel, { color: colors.gray600 }]}>
                  Total
                </Text>
              </View>
            </View>

            <View style={styles.amountInfo}>
              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: colors.gray600 }]}>
                  💰 Sudah Dibayar:
                </Text>
                <Text style={[styles.amountValue, { color: colors.success }]}>
                  {formatCurrency(user.paymentSummary.paidAmount)}
                </Text>
              </View>

              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: colors.gray600 }]}>
                  💸 Belum Dibayar:
                </Text>
                <Text style={[styles.amountValue, { color: colors.error }]}>
                  {formatCurrency(user.paymentSummary.unpaidAmount)}
                </Text>
              </View>
            </View>

            {user.paymentSummary.lastPaymentDate && (
              <View style={styles.lastPayment}>
                <Text style={[styles.lastPaymentText, { color: colors.gray500 }]}>
                  🕒 Terakhir bayar: {formatDate(user.paymentSummary.lastPaymentDate)}
                </Text>
              </View>
            )}

            {/* Progress Bar */}
            <View style={styles.progressBarSection}>
              {renderProgressBar({
                percentage: user.paymentSummary.progressPercentage,
                color: getStatusColor(user.paymentSummary.progressPercentage),
                height: 6,
              })}
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Action Buttons */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleUserPress(user)}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, { color: colors.white }]}>
              📊 Detail
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => {
              // Handle quick payment action
              router.push({
                pathname: "/(admin)/user-payment-detail",
                params: {
                  userId: user.id,
                  userName: user.namaWarga || "Warga",
                  timelineId: timeline?.id,
                  action: "payment",
                },
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, { color: colors.white }]}>
              💰 Bayar
            </Text>
          </TouchableOpacity>

          <View style={[styles.statusChip, { 
            backgroundColor: getStatusColor(user.paymentSummary.progressPercentage),
          }]}>
            <Text style={[styles.statusChipText, { color: colors.white }]}>
              {getStatusText(user.paymentSummary)}
            </Text>
          </View>
        </View>
      </View>
    ),
    [
      colors,
      handleUserPress,
      getStatusColor,
      getStatusText,
      formatCurrency,
      formatDate,
      renderProgressBar,
      router,
      timeline?.id,
    ]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyCard, { backgroundColor: colors.white }]}>
          <Text style={[styles.emptyIcon, { color: colors.gray400 }]}>👥</Text>
          <Text style={[styles.emptyText, { color: colors.gray600 }]}>
            {timeline ? "Belum ada data warga" : "Belum ada timeline aktif"}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.gray500 }]}>
            {timeline
              ? "Data warga akan muncul setelah ada yang mendaftar"
              : "Buat timeline terlebih dahulu untuk memulai"}
          </Text>
          {!timeline && (
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(admin)/timeline-manager")}
              activeOpacity={0.7}
            >
              <Text style={[styles.emptyButtonText, { color: colors.white }]}>
                🗓️ Buat Timeline
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    ),
    [colors, timeline, router]
  );

  const renderLoadingState = useCallback(
    () => (
      <View style={styles.loadingContainer}>
        <View style={[styles.loadingCard, { backgroundColor: colors.white }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.gray600 }]}>
            Memuat dashboard pembayaran...
          </Text>
          <Text style={[styles.loadingSubtext, { color: colors.gray500 }]}>
            Mohon tunggu sebentar
          </Text>
        </View>
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
              backgroundColor: colors.primary,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.white }]}>
              ← Kembali
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.white }]}>
            📊 Dashboard Pembayaran
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
          { backgroundColor: colors.primary },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: colors.white }]}>
            ← Kembali
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.white }]}>
          📊 Dashboard Pembayaran
        </Text>
        {timeline && (
          <Text style={[styles.subtitle, { color: colors.gray200 }]}>
            Timeline: {timeline.name}
          </Text>
        )}
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="Memuat ulang dashboard..."
            titleColor={colors.gray600}
          />
        }
      >
        {/* Dashboard Section */}
        {renderDashboard()}

        {/* Search Section */}
        {timeline && (
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.white,
                marginHorizontal: 16,
                marginVertical: 8,
              },
            ]}
          >
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.gray50,
                  borderColor: colors.gray300,
                  color: colors.gray900,
                },
              ]}
              placeholder="🔍 Cari nama warga, alamat, atau email..."
              placeholderTextColor={colors.gray500}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}

        {/* Users List Section */}
        <View style={styles.usersSection}>
          <View style={styles.usersSectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.gray900 }]}>
              👥 Daftar Warga ({filteredUsers.length})
            </Text>
            {selectedFilter !== "all" && (
              <TouchableOpacity
                style={[styles.clearFilterButton, { backgroundColor: colors.gray200 }]}
                onPress={() => setSelectedFilter("all")}
              >
                <Text style={[styles.clearFilterText, { color: colors.gray700 }]}>
                  ✕ Hapus Filter
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredUsers.length > 0 ? (
            <View style={styles.usersList}>
              {filteredUsers.map((user, index) => (
                <View key={user.id}>
                  {renderUserItem({ item: user })}
                </View>
              ))}
            </View>
          ) : (
            renderEmptyState()
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },

  // Dashboard Styles
  dashboardContainer: {
    padding: 16,
  },
  overviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dashboardCard: {
    width: (screenWidth - 48) / 2,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    marginRight: 12,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardData: {
    flex: 1,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 10,
    fontWeight: "500",
  },

  // Financial Card
  financialCard: {
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  financialStats: {
    marginBottom: 20,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  financialLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressBarContainer: {
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    borderRadius: 6,
  },

  // Filter Styles
  filtersSection: {
    marginBottom: 24,
  },
  filtersContainer: {
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  filterChipBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  filterChipBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Search Styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "500",
  },

  // Users Section
  usersSection: {
    padding: 16,
  },
  usersSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  usersList: {
    gap: 16,
  },

  // User Card Styles
  userCard: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  userCardContent: {
    padding: 20,
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
    fontWeight: "700",
    marginBottom: 4,
  },
  parentName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    fontWeight: "500",
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
    fontWeight: "700",
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
  summaryBadge: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  amountInfo: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },
  lastPayment: {
    marginTop: 8,
    marginBottom: 12,
  },
  lastPaymentText: {
    fontSize: 12,
    fontWeight: "500",
    fontStyle: "italic",
  },
  progressBarSection: {
    marginTop: 8,
  },

  // Card Actions
  cardActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 40,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});

export default PaymentStatus;
