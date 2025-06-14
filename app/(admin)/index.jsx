import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from "react-native";
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

        {/* Menu Cards */}
        <View style={styles.menuSection}>
          <Animated.View entering={FadeInDown.delay(100)}>
            <Card style={styles.menuCard} mode="elevated" onPress={handleTambahWarga}>
              <Card.Content style={styles.cardContent}>
                <Avatar.Icon 
                  size={56} 
                  icon="account-plus" 
                  style={{ backgroundColor: paperTheme.colors.primaryContainer }}
                  color={paperTheme.colors.onPrimaryContainer}
                />
                <View style={styles.cardTextSection}>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Tambah Data Warga
                  </Text>
                  <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    Daftarkan warga baru dan buat akun warga
                  </Text>
                </View>
                <IconButton 
                  icon="chevron-right" 
                  iconColor={paperTheme.colors.onSurfaceVariant}
                />
              </Card.Content>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)}>
            <Card style={styles.menuCard} mode="elevated" onPress={handleDaftarWarga}>
              <Card.Content style={styles.cardContent}>
                <Avatar.Icon 
                  size={56} 
                  icon="account-group" 
                  style={{ backgroundColor: paperTheme.colors.secondaryContainer }}
                  color={paperTheme.colors.onSecondaryContainer}
                />
                <View style={styles.cardTextSection}>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Daftar Warga
                  </Text>
                  <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    Lihat dan kelola data warga yang terdaftar
                  </Text>
                </View>
                <IconButton 
                  icon="chevron-right" 
                  iconColor={paperTheme.colors.onSurfaceVariant}
                />
              </Card.Content>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <Card style={styles.menuCard} mode="elevated" onPress={handleTimelineManager}>
              <Card.Content style={styles.cardContent}>
                <Avatar.Icon 
                  size={56} 
                  icon="calendar-clock" 
                  style={{ backgroundColor: paperTheme.colors.tertiaryContainer }}
                  color={paperTheme.colors.onTertiaryContainer}
                />
                <View style={styles.cardTextSection}>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Timeline Manager
                  </Text>
                  <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    Kelola timeline dan setoran jimpitan
                  </Text>
                </View>
                <IconButton 
                  icon="chevron-right" 
                  iconColor={paperTheme.colors.onSurfaceVariant}
                />
              </Card.Content>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <Card style={styles.menuCard} mode="elevated" onPress={handleCekPembayaran}>
              <Card.Content style={styles.cardContent}>
                <Avatar.Icon 
                  size={56} 
                  icon="wallet" 
                  style={{ backgroundColor: paperTheme.colors.surfaceVariant }}
                  color={paperTheme.colors.onSurfaceVariant}
                />
                <View style={styles.cardTextSection}>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Cek Status Setoran
                  </Text>
                  <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    Lihat status setoran jimpitan semua warga
                  </Text>
                </View>
                <IconButton 
                  icon="chevron-right" 
                  iconColor={paperTheme.colors.onSurfaceVariant}
                />
              </Card.Content>
            </Card>
          </Animated.View>

          {/* Seeder Card */}
          <Animated.View entering={FadeInDown.delay(500)}>
            <Card 
              style={[styles.menuCard, { backgroundColor: seederLoading ? paperTheme.colors.errorContainer : paperTheme.colors.errorContainer }]} 
              mode="elevated" 
              onPress={seederLoading ? undefined : handleSeeder}
            >
              <Card.Content style={styles.cardContent}>
                {seederLoading ? (
                  <ActivityIndicator size={56} animating color={paperTheme.colors.onErrorContainer} />
                ) : (
                  <Avatar.Icon 
                    size={56} 
                    icon="database-plus" 
                    style={{ backgroundColor: paperTheme.colors.error }}
                    color={paperTheme.colors.onError}
                  />
                )}
                <View style={styles.cardTextSection}>
                  <Text variant="titleMedium" style={[styles.cardTitle, { color: paperTheme.colors.onErrorContainer }]}>
                    {seederLoading ? "Generating Data..." : "Generate Data Warga"}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: paperTheme.colors.onErrorContainer }}>
                    {seederLoading
                      ? "Sedang membuat akun warga dengan data sequential..."
                      : "Buat akun warga dengan email sequential untuk testing"}
                  </Text>
                  <View style={{ marginTop: 8 }}>
                    <Text variant="bodySmall" style={{ color: paperTheme.colors.onErrorContainer, fontWeight: 'bold' }}>
                      Total: {seederStats.total} | Generated: {seederStats.seederUsers}
                    </Text>
                    <Text variant="bodySmall" style={{ color: paperTheme.colors.success, fontWeight: 'bold', fontFamily: 'monospace' }}>
                      Next: user{seederStats.nextUserNumber}@gmail.com
                    </Text>
                  </View>
                </View>
                <IconButton 
                  icon={seederLoading ? "clock" : "chevron-right"}
                  iconColor={paperTheme.colors.onErrorContainer}
                />
              </Card.Content>
            </Card>
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
              <Card.Content>
                <Text variant="bodyMedium" style={styles.previewTitle}>
                  Preview Email:
                </Text>
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
  menuSection: {
    gap: 16,
    marginBottom: 24,
  },
  menuCard: {
    borderRadius: 16,
    marginBottom: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  cardTextSection: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4,
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
  },
  previewTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  previewEmail: {
    fontFamily: 'monospace',
    marginBottom: 2,
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
    fontFamily: 'monospace',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default AdminHome;
