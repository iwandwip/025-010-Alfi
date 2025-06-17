import React, { useState, useEffect } from "react";
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  RefreshControl, 
  Alert, 
  TouchableOpacity, 
  Text,
  ActivityIndicator,
  Modal
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { signOutUser } from "../../services/authService";
import { seederService } from "../../services/seederService";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "../../constants/theme";
import NativeButton from "../../components/ui/NativeButton";
import NativeCard from "../../components/ui/NativeCard";
import NativeChip from "../../components/ui/NativeChip";

function AdminHome() {
  const { currentUser, userProfile } = useAuth();
  const { showGeneralNotification } = useNotification();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loggingOut, setLoggingOut] = useState(false);
  const [seederLoading, setSeederLoading] = useState(false);
  const [seederModalVisible, setSeederModalVisible] = useState(false);
  const [seederCount, setSeederCount] = useState("3");
  const [refreshing, setRefreshing] = useState(false);
  const [seederStats, setSeederStats] = useState({
    total: 0,
    seederUsers: 0,
    highestUserNumber: 0,
    nextUserNumber: 1,
  });

  useEffect(() => {
    loadSeederStats();
  }, []);

  const loadSeederStats = async () => {
    try {
      const stats = await seederService.getSeederStats();
      setSeederStats(stats);
    } catch (error) {
      console.error("Error loading seeder stats:", error);
      showGeneralNotification(
        "Error",
        "Gagal memuat statistik seeder",
        "error"
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSeederStats();
      showGeneralNotification(
        "Data Diperbarui",
        "Statistik seeder berhasil dimuat ulang",
        "success",
        { duration: 2000 }
      );
    } catch (error) {
      showGeneralNotification(
        "Error",
        "Gagal memuat ulang data",
        "error"
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Konfirmasi Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          const result = await signOutUser();
          if (result.success) {
            router.replace("/role-selection");
          } else {
            showGeneralNotification(
              "Gagal Logout",
              "Gagal keluar. Silakan coba lagi.",
              "error"
            );
          }
          setLoggingOut(false);
        },
      },
    ]);
  };

  const handleSeeder = () => {
    setSeederModalVisible(true);
  };

  const handleSeederConfirm = async () => {
    const count = parseInt(seederCount);

    if (isNaN(count) || count < 1 || count > 10) {
      Alert.alert("Error", "Jumlah akun harus antara 1-10");
      return;
    }

    setSeederModalVisible(false);

    const nextUser = seederStats.nextUserNumber;
    const emailList = [];
    for (let i = 0; i < count; i++) {
      emailList.push(`user${nextUser + i}@gmail.com`);
    }

    Alert.alert(
      "Generate Data Warga",
      `Akan membuat ${count} akun warga baru:\n${emailList.join(
        ", "
      )}\n\nLanjutkan?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Generate",
          onPress: async () => {
            setSeederLoading(true);

            try {
              const result = await seederService.createSeederUsers(count);

              if (result.success) {
                await loadSeederStats();

                let message = `✅ Berhasil membuat ${result.totalCreated} akun warga!\n\n`;

                result.created.forEach((user, index) => {
                  message += `${index + 1}. ${user.namaWarga}\n`;
                  message += `   Email: ${user.email}\n`;
                  message += `   Warga: ${user.namaWarga}\n`;
                  message += `   RFID: ${user.rfidWarga}\n\n`;
                });

                message += `Password semua akun: admin123`;

                if (result.totalErrors > 0) {
                  message += `\n\n⚠️ ${result.totalErrors} akun gagal dibuat`;
                }

                showGeneralNotification(
                  "Seeder Berhasil",
                  `Berhasil membuat ${result.totalCreated} akun warga baru`,
                  "success",
                  { duration: 5000 }
                );

                Alert.alert("Detail Seeder", message);
              } else {
                showGeneralNotification(
                  "Seeder Gagal",
                  result.error || "Terjadi kesalahan saat generate data",
                  "error"
                );
              }
            } catch (error) {
              showGeneralNotification(
                "Error",
                "Terjadi kesalahan: " + error.message,
                "error"
              );
            } finally {
              setSeederLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={[Colors.primaryLight + '20', Colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard Bendahara</Text>
        <Text style={styles.headerSubtitle}>RT 01 RW 02 Sukajadi</Text>
        {userProfile && (
          <NativeChip 
            icon={<MaterialIcons name="person" size={16} color={Colors.success} />}
            backgroundColor={Colors.success + '20'}
            textColor={Colors.success}
            style={{ marginTop: 8 }}
          >
            {userProfile.nama || userProfile.namaWarga || 'Admin'}
          </NativeChip>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            title="Tarik untuk memuat ulang..."
          />
        }
      >
        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {/* Row 1 */}
          <View style={styles.menuRow}>
            <Animated.View entering={FadeInDown.delay(100)} style={styles.gridItem}>
              <TouchableOpacity 
                onPress={() => router.push("/(admin)/tambah-warga")} 
                activeOpacity={0.7} 
                style={styles.menuButton}
              >
                <NativeCard style={styles.menuCard}>
                  <NativeCard.Content style={styles.menuContent}>
                    <MaterialIcons name="person-add" size={40} color={Colors.primary} />
                    <Text style={styles.menuTitle}>Tambah Data Warga</Text>
                    <Text style={styles.menuSubtitle}>
                      Daftarkan warga baru dan buat akun warga
                    </Text>
                  </NativeCard.Content>
                </NativeCard>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(150)} style={styles.gridItem}>
              <TouchableOpacity 
                onPress={() => router.push("/(admin)/daftar-warga")} 
                activeOpacity={0.7} 
                style={styles.menuButton}
              >
                <NativeCard style={styles.menuCard}>
                  <NativeCard.Content style={styles.menuContent}>
                    <MaterialIcons name="group" size={40} color={Colors.secondary} />
                    <Text style={styles.menuTitle}>Daftar Warga</Text>
                    <Text style={styles.menuSubtitle}>
                      Lihat dan kelola data warga yang terdaftar
                    </Text>
                  </NativeCard.Content>
                </NativeCard>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Row 2 */}
          <View style={styles.menuRow}>
            <Animated.View entering={FadeInDown.delay(200)} style={styles.gridItem}>
              <TouchableOpacity 
                onPress={() => router.push("/(admin)/timeline-manager")} 
                activeOpacity={0.7} 
                style={styles.menuButton}
              >
                <NativeCard style={styles.menuCard}>
                  <NativeCard.Content style={styles.menuContent}>
                    <MaterialIcons name="schedule" size={40} color={Colors.warning} />
                    <Text style={styles.menuTitle}>Timeline Manager</Text>
                    <Text style={styles.menuSubtitle}>
                      Kelola timeline dan setoran jimpitan
                    </Text>
                  </NativeCard.Content>
                </NativeCard>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(250)} style={styles.gridItem}>
              <TouchableOpacity 
                onPress={() => router.push("/(admin)/payment-status")} 
                activeOpacity={0.7} 
                style={styles.menuButton}
              >
                <NativeCard style={styles.menuCard}>
                  <NativeCard.Content style={styles.menuContent}>
                    <MaterialIcons name="wallet" size={40} color={Colors.success} />
                    <Text style={styles.menuTitle}>Cek Status Setoran</Text>
                    <Text style={styles.menuSubtitle}>
                      Lihat status setoran jimpitan semua warga
                    </Text>
                  </NativeCard.Content>
                </NativeCard>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Row 3 - Seeder Card (Full Width) */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.fullWidthItem}>
            <TouchableOpacity 
              onPress={seederLoading ? undefined : handleSeeder} 
              activeOpacity={0.7} 
              disabled={seederLoading}
            >
              <NativeCard style={[styles.seederCard, { backgroundColor: Colors.error + '10' }]}>
                <NativeCard.Content style={styles.seederContent}>
                  <View style={styles.seederIconSection}>
                    {seederLoading ? (
                      <ActivityIndicator size={40} color={Colors.error} />
                    ) : (
                      <MaterialIcons name="storage" size={40} color={Colors.error} />
                    )}
                  </View>
                  <View style={styles.seederTextSection}>
                    <Text style={[styles.seederTitle, { color: Colors.error }]}>
                      {seederLoading ? "Generating Data..." : "Generate Data Warga"}
                    </Text>
                    <Text style={[styles.seederSubtitle, { color: Colors.textSecondary }]}>
                      {seederLoading
                        ? "Sedang membuat akun warga dengan data sequential..."
                        : "Buat akun warga dengan email sequential untuk testing"}
                    </Text>
                    <View style={styles.seederStats}>
                      <Text style={[styles.seederStatsText, { color: Colors.textSecondary }]}>
                        Total: {seederStats.total} | Generated: {seederStats.seederUsers}
                      </Text>
                      <Text style={[styles.seederNextText, { color: Colors.success }]}>
                        Next: user{seederStats.nextUserNumber}@gmail.com
                      </Text>
                    </View>
                  </View>
                  <View style={styles.seederIconEnd}>
                    <MaterialIcons 
                      name={seederLoading ? "hourglass-empty" : "chevron-right"} 
                      size={24} 
                      color={Colors.error}
                    />
                  </View>
                </NativeCard.Content>
              </NativeCard>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Logout Button */}
        <Animated.View entering={FadeInUp.delay(600)}>
          <NativeButton
            title={loggingOut ? "Sedang Keluar..." : "Keluar"}
            onPress={handleLogout}
            disabled={loggingOut}
            loading={loggingOut}
            variant="outlined"
            style={[styles.logoutButton, { borderColor: Colors.error }]}
            textStyle={{ color: Colors.error }}
          />
        </Animated.View>
      </ScrollView>

      {/* Seeder Modal */}
      <Modal 
        visible={seederModalVisible} 
        transparent={true}
        animationType="fade"
        onRequestClose={() => !seederLoading && setSeederModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <NativeCard style={styles.modalContainer}>
            <NativeCard.Content>
              <View style={styles.modalHeader}>
                <MaterialIcons name="storage" size={32} color={Colors.primary} />
                <Text style={styles.modalTitle}>Generate Data Warga</Text>
                <TouchableOpacity
                  onPress={() => setSeederModalVisible(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContent}>
                <Text style={styles.inputLabel}>Jumlah Akun (1-10):</Text>
                <Text style={styles.numberInput}>{seederCount}</Text>

                <NativeCard mode="outlined" style={styles.previewCard}>
                  <NativeCard.Content>
                    <Text style={styles.previewTitle}>📧 Preview Email:</Text>
                    <ScrollView style={styles.previewScrollView} showsVerticalScrollIndicator={false}>
                      {(() => {
                        const count = parseInt(seederCount) || 0;
                        if (count >= 1 && count <= 10) {
                          const emails = [];
                          for (let i = 0; i < count; i++) {
                            emails.push(
                              `user${seederStats.nextUserNumber + i}@gmail.com`
                            );
                          }
                          return emails.map((email, index) => (
                            <View key={index} style={styles.emailRow}>
                              <MaterialIcons name="person" size={16} color={Colors.primary} />
                              <Text style={styles.previewEmail}>{email}</Text>
                            </View>
                          ));
                        }
                        return (
                          <Text style={{ color: Colors.error, fontStyle: 'italic' }}>
                            ⚠️ Jumlah harus 1-10
                          </Text>
                        );
                      })()}
                    </ScrollView>
                  </NativeCard.Content>
                </NativeCard>

                <NativeCard style={[styles.infoCard, { backgroundColor: Colors.info + '10' }]}>
                  <NativeCard.Content style={{ paddingVertical: 12 }}>
                    <Text style={{ color: Colors.info, lineHeight: 18 }}>
                      💡 Password untuk semua akun: <Text style={{ fontWeight: 'bold' }}>admin123</Text>
                    </Text>
                  </NativeCard.Content>
                </NativeCard>
              </View>

              <View style={styles.modalActions}>
                <NativeButton
                  title="Batal"
                  onPress={() => setSeederModalVisible(false)}
                  variant="outlined"
                  style={styles.modalButton}
                />
                <NativeButton
                  title="Generate"
                  onPress={handleSeederConfirm}
                  style={styles.modalButton}
                />
              </View>
            </NativeCard.Content>
          </NativeCard>
        </View>
      </Modal>

      {/* Loading Modal */}
      {seederLoading && (
        <Modal transparent={true} visible={seederLoading}>
          <View style={styles.loadingModalOverlay}>
            <NativeCard style={styles.loadingCard}>
              <NativeCard.Content style={styles.loadingContent}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingTitle}>Generating Data Warga</Text>
                <Text style={styles.loadingSubtitle}>
                  Membuat {seederCount} akun dengan email sequential...
                </Text>
                <Text style={styles.loadingNext}>
                  Next: user{seederStats.nextUserNumber}@gmail.com
                </Text>
              </NativeCard.Content>
            </NativeCard>
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  headerTitle: {
    ...Typography.h3,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  menuGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  menuRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  gridItem: {
    flex: 1,
  },
  fullWidthItem: {
    width: '100%',
  },
  menuButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  menuCard: {
    aspectRatio: 1,
  },
  menuContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  menuTitle: {
    ...Typography.body2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  menuSubtitle: {
    ...Typography.caption,
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.8,
  },
  seederCard: {
    marginTop: 8,
  },
  seederContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  seederIconSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  seederTextSection: {
    flex: 1,
  },
  seederTitle: {
    ...Typography.body2,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  seederSubtitle: {
    ...Typography.caption,
    marginBottom: 8,
    opacity: 0.8,
  },
  seederStats: {
    gap: 2,
  },
  seederStatsText: {
    ...Typography.caption,
    fontWeight: 'bold',
  },
  seederNextText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  seederIconEnd: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    borderRadius: BorderRadius.xxl,
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContainer: {
    maxWidth: 400,
    maxHeight: '80%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.h4,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.body2,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  numberInput: {
    ...Typography.h4,
    textAlign: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  previewCard: {
    maxHeight: 120,
    marginBottom: Spacing.sm,
  },
  previewScrollView: {
    maxHeight: 80,
    paddingVertical: 4,
  },
  previewTitle: {
    ...Typography.body2,
    fontWeight: '600',
    marginBottom: 8,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  previewEmail: {
    ...Typography.caption,
    flex: 1,
  },
  infoCard: {
    marginTop: Spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
  loadingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  loadingCard: {
    minWidth: 280,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  loadingTitle: {
    ...Typography.h4,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  loadingSubtitle: {
    ...Typography.body2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  loadingNext: {
    ...Typography.caption,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default AdminHome;