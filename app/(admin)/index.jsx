import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, Alert, TouchableOpacity, Text as RNText } from "react-native";
import {
  Surface,
  Text,
  Card,
  Button,
  IconButton,
  Avatar,
  Chip,
  Divider,
  Modal,
  Portal,
  TextInput,
  ActivityIndicator,
  useTheme,
  FAB
} from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { signOutUser } from "../../services/authService";
import { seederService } from "../../services/seederService";
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';

function AdminHome() {
  const { currentUser, userProfile } = useAuth();
  const { showGeneralNotification } = useNotification();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paperTheme = useTheme();
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

  const handleTambahWarga = () => {
    router.push("/(admin)/tambah-warga");
  };

  const handleDaftarWarga = () => {
    router.push("/(admin)/daftar-warga");
  };

  const handleTimelineManager = () => {
    router.push("/(admin)/timeline-manager");
  };

  const handleCekPembayaran = () => {
    router.push("/(admin)/payment-status");
  };

  return (
    <LinearGradient
      colors={[paperTheme.colors.primaryContainer, paperTheme.colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Dashboard Bendahara
        </Text>
        <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
          RT 01 RW 02 Sukajadi
        </Text>
        {userProfile && (
          <Chip 
            icon="account-tie" 
            mode="flat"
            style={{ backgroundColor: paperTheme.colors.successContainer, marginTop: 8 }}
            textStyle={{ color: paperTheme.colors.onSuccessContainer }}
          >
            {userProfile.nama}
          </Chip>
        )}
      </Surface>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[paperTheme.colors.primary]}
            tintColor={paperTheme.colors.primary}
            title="Tarik untuk memuat ulang..."
          />
        }
      >

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {/* Row 1 */}
          <View style={styles.menuRow}>
            <Animated.View entering={FadeInDown.delay(100)} style={styles.gridItem}>
              <TouchableOpacity onPress={handleTambahWarga} activeOpacity={0.7} style={styles.menuButton}>
                <View style={[styles.menuCard, { backgroundColor: 'white' }]}>
                  <Avatar.Icon 
                    size={40} 
                    icon="account-plus" 
                    style={{ backgroundColor: paperTheme.colors.primary }}
                    color={paperTheme.colors.onPrimary}
                  />
                  <RNText style={[styles.menuTitle, { color: '#000' }]}>
                    Tambah Data Warga
                  </RNText>
                  <RNText style={[styles.menuSubtitle, { color: '#666' }]}>
                    Daftarkan warga baru dan buat akun warga
                  </RNText>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(150)} style={styles.gridItem}>
              <TouchableOpacity onPress={handleDaftarWarga} activeOpacity={0.7} style={styles.menuButton}>
                <View style={[styles.menuCard, { backgroundColor: 'white' }]}>
                  <Avatar.Icon 
                    size={40} 
                    icon="account-group" 
                    style={{ backgroundColor: paperTheme.colors.secondary }}
                    color={paperTheme.colors.onSecondary}
                  />
                  <RNText style={[styles.menuTitle, { color: '#000' }]}>
                    Daftar Warga
                  </RNText>
                  <RNText style={[styles.menuSubtitle, { color: '#666' }]}>
                    Lihat dan kelola data warga yang terdaftar
                  </RNText>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Row 2 */}
          <View style={styles.menuRow}>
            <Animated.View entering={FadeInDown.delay(200)} style={styles.gridItem}>
              <TouchableOpacity onPress={handleTimelineManager} activeOpacity={0.7} style={styles.menuButton}>
                <View style={[styles.menuCard, { backgroundColor: 'white' }]}>
                  <Avatar.Icon 
                    size={40} 
                    icon="calendar-clock" 
                    style={{ backgroundColor: paperTheme.colors.tertiary }}
                    color={paperTheme.colors.onTertiary}
                  />
                  <RNText style={[styles.menuTitle, { color: '#000' }]}>
                    Timeline Manager
                  </RNText>
                  <RNText style={[styles.menuSubtitle, { color: '#666' }]}>
                    Kelola timeline dan setoran jimpitan
                  </RNText>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(250)} style={styles.gridItem}>
              <TouchableOpacity onPress={handleCekPembayaran} activeOpacity={0.7} style={styles.menuButton}>
                <View style={[styles.menuCard, { backgroundColor: 'white' }]}>
                  <Avatar.Icon 
                    size={40} 
                    icon="wallet" 
                    style={{ backgroundColor: paperTheme.colors.onSurfaceVariant }}
                    color={paperTheme.colors.surfaceVariant}
                  />
                  <RNText style={[styles.menuTitle, { color: '#000' }]}>
                    Cek Status Setoran
                  </RNText>
                  <RNText style={[styles.menuSubtitle, { color: '#666' }]}>
                    Lihat status setoran jimpitan semua warga
                  </RNText>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Row 3 - Seeder Card (Full Width) */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.fullWidthItem}>
            <TouchableOpacity onPress={seederLoading ? undefined : handleSeeder} activeOpacity={0.7} disabled={seederLoading}>
              <View style={[styles.seederCard, { backgroundColor: paperTheme.colors.errorContainer }]}>
                <View style={styles.seederContent}>
                  <View style={styles.seederIconSection}>
                    {seederLoading ? (
                      <ActivityIndicator size={40} animating color={paperTheme.colors.onErrorContainer} />
                    ) : (
                      <Avatar.Icon 
                        size={40} 
                        icon="database-plus" 
                        style={{ backgroundColor: paperTheme.colors.error }}
                        color={paperTheme.colors.onError}
                      />
                    )}
                  </View>
                  <View style={styles.seederTextSection}>
                    <RNText style={[styles.seederTitle, { color: paperTheme.colors.onErrorContainer }]}>
                      {seederLoading ? "Generating Data..." : "Generate Data Warga"}
                    </RNText>
                    <RNText style={[styles.seederSubtitle, { color: paperTheme.colors.onErrorContainer }]}>
                      {seederLoading
                        ? "Sedang membuat akun warga dengan data sequential..."
                        : "Buat akun warga dengan email sequential untuk testing"}
                    </RNText>
                    <View style={styles.seederStats}>
                      <RNText style={[styles.seederStatsText, { color: paperTheme.colors.onErrorContainer }]}>
                        Total: {seederStats.total} | Generated: {seederStats.seederUsers}
                      </RNText>
                      <RNText style={[styles.seederNextText, { color: paperTheme.colors.success }]}>
                        Next: user{seederStats.nextUserNumber}@gmail.com
                      </RNText>
                    </View>
                  </View>
                  <View style={styles.seederIconEnd}>
                    <Avatar.Icon 
                      size={24} 
                      icon={seederLoading ? "clock" : "chevron-right"}
                      style={{ backgroundColor: 'transparent' }}
                      color={paperTheme.colors.onErrorContainer}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Logout Button */}
        <Animated.View entering={FadeInUp.delay(600)}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            disabled={loggingOut}
            loading={loggingOut}
            style={[styles.logoutButton, { borderColor: paperTheme.colors.error }]}
            contentStyle={styles.buttonContent}
            labelStyle={{ color: paperTheme.colors.error }}
            icon="logout"
          >
            {loggingOut ? "Sedang Keluar..." : "Keluar"}
          </Button>
        </Animated.View>
      </ScrollView>

      {/* Seeder Modal */}
      <Portal>
        <Modal 
          visible={seederModalVisible} 
          onDismiss={() => !seederLoading && setSeederModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>Generate Data Warga</Text>
            <IconButton
              icon="close"
              onPress={() => setSeederModalVisible(false)}
              style={styles.closeButton}
            />
          </View>

          <View style={styles.modalContent}>
            <Text variant="bodyLarge" style={styles.inputLabel}>
              Jumlah Akun (1-10):
            </Text>
            <TextInput
              value={seederCount}
              onChangeText={setSeederCount}
              mode="outlined"
              keyboardType="numeric"
              placeholder="Masukkan jumlah"
              style={styles.numberInput}
              maxLength={2}
              outlineStyle={{ borderRadius: 12 }}
            />

            <Card style={styles.previewCard} mode="outlined">
              <Card.Content style={styles.previewCardContent}>
                <Text variant="bodyMedium" style={styles.previewTitle}>
                  Preview Email:
                </Text>
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
                        <Text key={index} variant="bodySmall" style={styles.previewEmail}>
                          {email}
                        </Text>
                      ));
                    }
                    return (
                      <Text variant="bodySmall" style={{ color: paperTheme.colors.error, fontStyle: 'italic' }}>
                        Jumlah harus 1-10
                      </Text>
                    );
                  })()}
                </ScrollView>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setSeederModalVisible(false)}
              style={styles.modalButton}
            >
              Batal
            </Button>
            <Button
              mode="contained"
              onPress={handleSeederConfirm}
              style={styles.modalButton}
            >
              Generate
            </Button>
          </View>
        </Modal>

        {/* Loading Modal */}
        <Modal visible={seederLoading} dismissable={false} contentContainerStyle={styles.loadingModalContainer}>
          <Card style={styles.loadingCard}>
            <Card.Content style={styles.loadingContent}>
              <ActivityIndicator size="large" animating />
              <Text variant="titleMedium" style={styles.loadingTitle}>
                Generating Data Warga
              </Text>
              <Text variant="bodyMedium" style={styles.loadingSubtitle}>
                Membuat {seederCount} akun dengan email sequential...
              </Text>
              <Text variant="bodySmall" style={styles.loadingNext}>
                Next: user{seederStats.nextUserNumber}@gmail.com
              </Text>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  menuGrid: {
    gap: 16,
    marginBottom: 24,
  },
  menuRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  fullWidthItem: {
    width: '100%',
  },
  menuButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuCard: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
  },
  menuTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 11,
    opacity: 0.8,
  },
  seederCard: {
    borderRadius: 16,
    marginTop: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  seederContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  seederIconSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  seederTextSection: {
    flex: 1,
  },
  seederTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  seederSubtitle: {
    fontSize: 11,
    marginBottom: 8,
    opacity: 0.8,
  },
  seederStats: {
    gap: 2,
  },
  seederStatsText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  seederNextText: {
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
  },
  seederIconEnd: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    borderRadius: 28,
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    maxWidth: 400,
    maxHeight: '80%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontWeight: '600',
  },
  closeButton: {
    margin: 0,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: 12,
  },
  numberInput: {
    marginBottom: 16,
    textAlign: 'center',
  },
  previewCard: {
    borderRadius: 12,
    maxHeight: 100,
  },
  previewCardContent: {
    paddingBottom: 4,
  },
  previewScrollView: {
    maxHeight: 60,
  },
  previewTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  previewEmail: {
    fontFamily: 'Poppins-Regular',
    marginBottom: 2,
    fontSize: 11,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 24,
  },
  loadingModalContainer: {
    margin: 20,
    alignItems: 'center',
  },
  loadingCard: {
    borderRadius: 20,
    minWidth: 280,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingTitle: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingNext: {
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default AdminHome;
