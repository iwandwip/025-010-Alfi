import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { lightTheme } from "../../constants/Colors";
import Button from "../../components/ui/Button";
import { signOutUser } from "../../services/authService";
import { seederService } from "../../services/seederService";
import { 
  unlockSolenoid, 
  lockSolenoid, 
  getSolenoidCommand,
  subscribeToSolenoidCommand,
  subscribeToModeChanges
} from "../../services/rtdbModeService";

function AdminHome() {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { showGeneralNotification } = useNotification();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = lightTheme;
  const [loggingOut, setLoggingOut] = useState(false);
  const [seederLoading, setSeederLoading] = useState(false);
  const [seederModalVisible, setSeederModalVisible] = useState(false);
  const [solenoidModalVisible, setSolenoidModalVisible] = useState(false);
  const [keuanganModalVisible, setKeuanganModalVisible] = useState(false);
  const [seederCount, setSeederCount] = useState("3");
  const [refreshing, setRefreshing] = useState(false);
  const [seederStats, setSeederStats] = useState({
    total: 0,
    seederUsers: 0,
    highestUserNumber: 0,
    nextUserNumber: 1,
  });
  const [solenoidCommand, setSolenoidCommand] = useState('locked'); // 'locked' | 'unlock'
  const [currentMode, setCurrentMode] = useState('idle'); // 'idle' | 'pairing' | 'payment' | 'solenoid'
  const [solenoidLoading, setSolenoidLoading] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0); // Countdown timer in seconds
  const [countdownInterval, setCountdownInterval] = useState(null);

  useEffect(() => {
    loadSeederStats();
    loadSolenoidCommand();
    
    // Revolutionary mode-based subscriptions
    const unsubscribeSolenoid = subscribeToSolenoidCommand((command) => {
      setSolenoidCommand(command);
    });
    
    const unsubscribeMode = subscribeToModeChanges((mode) => {
      setCurrentMode(mode);
    });

    return () => {
      if (unsubscribeSolenoid) unsubscribeSolenoid();
      if (unsubscribeMode) unsubscribeMode();
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
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

  const loadSolenoidCommand = async () => {
    try {
      const command = await getSolenoidCommand();
      setSolenoidCommand(command);
    } catch (error) {
      console.error("Error loading solenoid command:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadSeederStats(), loadSolenoidCommand()]);
      showGeneralNotification(
        "Data Diperbarui",
        "Data dan status mode-based berhasil dimuat ulang",
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

  const handleSolenoidControl = () => {
    setSolenoidModalVisible(true);
  };

  const handleKeuangan = () => {
    setKeuanganModalVisible(true);
  };

  const handlePemasukan = () => {
    setKeuanganModalVisible(false);
    router.push("/(admin)/payment-status");
  };

  const handlePengeluaran = () => {
    setKeuanganModalVisible(false);
    router.push("/(admin)/pengeluaran");
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
                  message += `   Alamat: ${user.alamat}\n`;
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
    handleKeuangan();
  };

  const formatCountdownTime = (seconds) => {
    if (seconds <= 0) return "";
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const startCountdown = (duration) => {
    setCountdownTime(duration);
    
    // Clear any existing interval
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    const interval = setInterval(() => {
      setCountdownTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCountdownInterval(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setCountdownInterval(interval);
  };

  const handleUnlockSolenoid = async (duration = 30) => {
    setSolenoidLoading(true);
    
    try {
      const result = await unlockSolenoid(duration);
      
      if (result.success) {
        // Start countdown timer
        startCountdown(duration);
        
        showGeneralNotification(
          "Mode Solenoid Aktif",
          `Alat dibuka untuk ${duration} detik. Mode akan kembali ke idle otomatis.`,
          "success",
          { duration: 3000 }
        );
      } else {
        // Handle different failure reasons
        if (result.reason === 'system_busy') {
          showGeneralNotification(
            "Sistem Sedang Sibuk",
            result.message || `Tidak bisa unlock, sistem sedang: ${result.currentMode}`,
            "warning",
            { duration: 4000 }
          );
        } else {
          showGeneralNotification(
            "Gagal Mode Unlock",
            "Gagal mengaktifkan mode solenoid",
            "error"
          );
        }
      }
    } catch (error) {
      showGeneralNotification(
        "Error",
        "Terjadi kesalahan saat mengaktifkan mode solenoid",
        "error"
      );
    } finally {
      setSolenoidLoading(false);
    }
  };

  const handleLockSolenoid = async () => {
    setSolenoidLoading(true);
    
    // Stop countdown timer when manually locking
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setCountdownTime(0);
    
    try {
      const result = await lockSolenoid();
      
      if (result.success) {
        showGeneralNotification(
          "Mode Idle Aktif",
          "Alat ditutup paksa dan mode kembali ke idle",
          "success",
          { duration: 3000 }
        );
      } else {
        showGeneralNotification(
          "Gagal Mode Lock",
          "Gagal mengaktifkan mode lock",
          "error"
        );
      }
    } catch (error) {
      showGeneralNotification(
        "Error",
        "Terjadi kesalahan saat mengaktifkan mode lock",
        "error"
      );
    } finally {
      setSolenoidLoading(false);
    }
  };

  const handleEmergencyUnlock = async () => {
    Alert.alert(
      "🚨 Emergency Mode-based Unlock",
      "Mode-based emergency unlock akan langsung mengubah command di RTDB tanpa timeout.\n\n⚠️ ESP32 akan membaca perubahan dalam 1 detik!\n\nLanjutkan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Emergency Unlock",
          style: "destructive",
          onPress: async () => {
            setSolenoidLoading(true);
            try {
              // Emergency uses regular unlock but with very long duration
              const result = await unlockSolenoid(3600); // 1 hour
              if (result.success) {
                // Start countdown for emergency unlock
                startCountdown(3600);
                setSolenoidCommand('unlock');
                showGeneralNotification(
                  "🚨 Emergency Mode-based Unlock",
                  "RTDB command berhasil dikirim!\n\n⚡ ESP32 akan detect dalam 1 detik\n🔓 Auto-lock dalam 1 jam",
                  "warning",
                  { duration: 6000 }
                );
              } else {
                showGeneralNotification(
                  "Gagal Emergency Unlock",
                  "Gagal mengirim emergency command via RTDB",
                  "error"
                );
              }
            } catch (error) {
              showGeneralNotification(
                "Error",
                "Terjadi kesalahan saat emergency mode-based unlock",
                "error"
              );
            } finally {
              setSolenoidLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleUnlockWithDuration = () => {
    Alert.alert(
      "🔥 Mode-based Solenoid Control",
      "Pilih durasi unlock via RTDB (app-managed timeout):",
      [
        { text: "Batal", style: "cancel" },
        { text: "⚡ 30 detik", onPress: () => handleUnlockSolenoid(30) },
        { text: "🕐 1 menit", onPress: () => handleUnlockSolenoid(60) },
        { text: "🕔 5 menit", onPress: () => handleUnlockSolenoid(300) },
        { text: "Emergency (24h)", style: "destructive", onPress: handleEmergencyUnlock }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.gray50 }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="Tarik untuk memuat ulang..."
            titleColor={colors.gray600}
          />
        }
      >
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <View style={[styles.logo, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
              <Text style={styles.logoIcon}>💰</Text>
            </View>
          </View>
          <Text style={[styles.title, { color: colors.primary }]}>Dashboard Bendahara</Text>
          <Text style={[styles.subtitle, { color: colors.gray500 }]}>Sistem Jimpitan Warga</Text>
          {userProfile && (
            <Text style={[styles.welcomeText, { color: colors.primaryLight }]}>
              Selamat datang, {userProfile.nama}
            </Text>
          )}
        </View>

        <View style={styles.menuSection}>
          {/* Grid 2x3 Layout */}
          <View style={styles.gridContainer}>
            {/* Row 1 */}
            <View style={styles.gridRow}>
              <TouchableOpacity
                style={[styles.gridCard, { borderColor: colors.primary, backgroundColor: colors.primary }]}
                onPress={handleTambahWarga}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIcon, { backgroundColor: colors.white }]}>
                  <Text style={[styles.gridIconText, { color: colors.primary }]}>👤</Text>
                </View>
                <Text style={[styles.gridTitle, { color: colors.white }]}>Tambah Warga</Text>
                <Text style={[styles.gridDesc, { color: colors.white }]}>
                  Daftarkan warga baru
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gridCard, { borderColor: colors.primaryLight, backgroundColor: colors.primaryLight }]}
                onPress={handleDaftarWarga}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIcon, { backgroundColor: colors.white }]}>
                  <Text style={[styles.gridIconText, { color: colors.primaryLight }]}>📋</Text>
                </View>
                <Text style={[styles.gridTitle, { color: colors.white }]}>Daftar Warga</Text>
                <Text style={[styles.gridDesc, { color: colors.white }]}>
                  Kelola data warga
                </Text>
              </TouchableOpacity>
            </View>

            {/* Row 2 */}
            <View style={styles.gridRow}>
              <TouchableOpacity
                style={[styles.gridCard, { borderColor: colors.secondary, backgroundColor: colors.secondary }]}
                onPress={handleTimelineManager}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIcon, { backgroundColor: colors.white }]}>
                  <Text style={[styles.gridIconText, { color: colors.secondary }]}>📅</Text>
                </View>
                <Text style={[styles.gridTitle, { color: colors.white }]}>Timeline Manager</Text>
                <Text style={[styles.gridDesc, { color: colors.white }]}>
                  Kelola timeline
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gridCard, { borderColor: colors.primaryDark, backgroundColor: colors.primaryDark }]}
                onPress={handleCekPembayaran}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIcon, { backgroundColor: colors.white }]}>
                  <Text style={[styles.gridIconText, { color: colors.primaryDark }]}>💰</Text>
                </View>
                <Text style={[styles.gridTitle, { color: colors.white }]}>Keuangan</Text>
                <Text style={[styles.gridDesc, { color: colors.white }]}>
                  Pemasukan & Pengeluaran
                </Text>
              </TouchableOpacity>
            </View>

            {/* Row 3 */}
            <View style={styles.gridRow}>
              <TouchableOpacity
                style={[styles.gridCard, { borderColor: colors.warning, backgroundColor: colors.warning }]}
                onPress={handleSolenoidControl}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIcon, { backgroundColor: colors.white }]}>
                  <Text style={[styles.gridIconText, { color: colors.warning }]}>🔐</Text>
                </View>
                <Text style={[styles.gridTitle, { color: colors.white }]}>Kontrol Solenoid</Text>
                <Text style={[styles.gridDesc, { color: colors.white }]}>
                  {currentMode === 'solenoid' ? 'Mode Unlock' : solenoidCommand === 'unlock' ? 'Unlocked' : 'Locked'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gridCard, { borderColor: colors.error, backgroundColor: colors.error }]}
                onPress={handleSeeder}
                activeOpacity={0.8}
                disabled={seederLoading}
              >
                <View style={[styles.gridIcon, { backgroundColor: colors.white }]}>
                  <Text style={[styles.gridIconText, { color: colors.error }]}>
                    {seederLoading ? "⏳" : "🎲"}
                  </Text>
                </View>
                <Text style={[styles.gridTitle, { color: colors.white }]}>Generate Data</Text>
                <Text style={[styles.gridDesc, { color: colors.white }]}>
                  {seederLoading ? "Generating..." : "Buat data warga"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.logoutSection}>
          <Button
            title={loggingOut ? "Sedang Keluar..." : "Keluar"}
            onPress={handleLogout}
            variant="outline"
            disabled={loggingOut}
            style={[styles.logoutButton, { borderColor: colors.error }]}
          />
        </View>
      </ScrollView>

      <Modal
        visible={seederModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !seederLoading && setSeederModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Data Warga</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSeederModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Jumlah Akun (1-10):</Text>
              <TextInput
                style={styles.numberInput}
                value={seederCount}
                onChangeText={setSeederCount}
                keyboardType="numeric"
                placeholder="Masukkan jumlah"
                maxLength={2}
              />

              <View style={styles.previewSection}>
                <Text style={styles.previewTitle}>Preview Email:</Text>
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
                      <Text key={index} style={styles.previewEmail}>
                        {email}
                      </Text>
                    ));
                  }
                  return (
                    <Text style={styles.previewError}>Jumlah harus 1-10</Text>
                  );
                })()}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Batal"
                onPress={() => setSeederModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Generate"
                onPress={handleSeederConfirm}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Solenoid Control Modal */}
      <Modal
        visible={solenoidModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !solenoidLoading && setSolenoidModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔐 Kontrol Solenoid</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSolenoidModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.solenoidStatusSection}>
                <Text style={styles.statusSectionTitle}>Status Saat Ini:</Text>
                <View style={[
                  styles.statusIndicator,
                  { 
                    backgroundColor: currentMode === 'solenoid' ? colors.warning + '20' : 
                                   solenoidCommand === 'unlock' ? colors.success + '20' : colors.error + '20'
                  }
                ]}>
                  <Text style={[styles.statusIndicatorText, { 
                    color: currentMode === 'solenoid' ? colors.warning : 
                           solenoidCommand === 'unlock' ? colors.success : colors.error
                  }]}>
                    {currentMode === 'solenoid' ? '🔓 UNLOCK MODE AKTIF' : 
                     solenoidCommand === 'unlock' ? '🔓 Solenoid Unlocked' : '🔒 Solenoid Locked'}
                  </Text>
                </View>
                
                {countdownTime > 0 && (
                  <View style={styles.countdownSection}>
                    <Text style={styles.countdownLabel}>Countdown:</Text>
                    <Text style={[styles.countdownTime, { color: colors.warning }]}>
                      {formatCountdownTime(countdownTime)}
                    </Text>
                  </View>
                )}

                <Text style={styles.modeStatusText}>
                  Mode: {currentMode.toUpperCase()}
                </Text>
              </View>

              <View style={styles.solenoidControlSection}>
                <Text style={styles.controlSectionTitle}>Kontrol:</Text>
                
                <TouchableOpacity
                  style={[
                    styles.modalSolenoidButton,
                    { backgroundColor: countdownTime > 0 ? colors.warning : colors.success },
                    solenoidLoading && { opacity: 0.7 }
                  ]}
                  onPress={() => {
                    setSolenoidModalVisible(false);
                    handleUnlockWithDuration();
                  }}
                  disabled={solenoidLoading || countdownTime > 0}
                  activeOpacity={0.8}
                >
                  {solenoidLoading ? (
                    <ActivityIndicator size={20} color={colors.white} />
                  ) : (
                    <Text style={styles.modalSolenoidIcon}>🔓</Text>
                  )}
                  <Text style={[styles.modalSolenoidText, { color: colors.white }]}>
                    {countdownTime > 0 ? `Aktif (${formatCountdownTime(countdownTime)})` : "Buka Solenoid"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalSolenoidButton,
                    { backgroundColor: colors.error },
                    solenoidLoading && { opacity: 0.7 }
                  ]}
                  onPress={() => {
                    setSolenoidModalVisible(false);
                    handleLockSolenoid();
                  }}
                  disabled={solenoidLoading}
                  activeOpacity={0.8}
                >
                  {solenoidLoading ? (
                    <ActivityIndicator size={20} color={colors.white} />
                  ) : (
                    <Text style={styles.modalSolenoidIcon}>🔒</Text>
                  )}
                  <Text style={[styles.modalSolenoidText, { color: colors.white }]}>
                    Tutup Solenoid
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalSolenoidButton,
                    styles.emergencyButton,
                    { backgroundColor: colors.primaryDark },
                    solenoidLoading && { opacity: 0.7 }
                  ]}
                  onPress={() => {
                    setSolenoidModalVisible(false);
                    handleEmergencyUnlock();
                  }}
                  disabled={solenoidLoading}
                  activeOpacity={0.8}
                >
                  {solenoidLoading ? (
                    <ActivityIndicator size={20} color={colors.white} />
                  ) : (
                    <Text style={styles.modalSolenoidIcon}>🚨</Text>
                  )}
                  <Text style={[styles.modalSolenoidText, { color: colors.white }]}>
                    Emergency Unlock
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Tutup"
                onPress={() => setSolenoidModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Keuangan Selection Modal */}
      <Modal
        visible={keuanganModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setKeuanganModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💰 Manajemen Keuangan</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setKeuanganModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.keuanganDescription}>
                Pilih menu keuangan yang ingin Anda kelola:
              </Text>

              <View style={styles.keuanganOptionsContainer}>
                <TouchableOpacity
                  style={[styles.keuanganOptionCard, { backgroundColor: '#f0fdfa', borderColor: colors.success }]}
                  onPress={handlePemasukan}
                  activeOpacity={0.8}
                >
                  <View style={[styles.keuanganOptionIcon, { backgroundColor: colors.success }]}>
                    <Text style={styles.keuanganOptionIconText}>📈</Text>
                  </View>
                  <Text style={[styles.keuanganOptionTitle, { color: colors.success }]}>Pemasukan</Text>
                  <Text style={styles.keuanganOptionDesc}>
                    Lihat status pembayaran jimpitan warga dan dashboard keuangan masuk
                  </Text>
                  <View style={styles.keuanganOptionFeatures}>
                    <Text style={styles.keuanganFeatureItem}>• Status pembayaran warga</Text>
                    <Text style={styles.keuanganFeatureItem}>• Dashboard pemasukan</Text>
                    <Text style={styles.keuanganFeatureItem}>• Laporan pembayaran</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.keuanganOptionCard, { backgroundColor: '#fef2f2', borderColor: colors.error }]}
                  onPress={handlePengeluaran}
                  activeOpacity={0.8}
                >
                  <View style={[styles.keuanganOptionIcon, { backgroundColor: colors.error }]}>
                    <Text style={styles.keuanganOptionIconText}>📉</Text>
                  </View>
                  <Text style={[styles.keuanganOptionTitle, { color: colors.error }]}>Pengeluaran</Text>
                  <Text style={styles.keuanganOptionDesc}>
                    Kelola pengeluaran dari dana jimpitan dan lihat saldo tersisa
                  </Text>
                  <View style={styles.keuanganOptionFeatures}>
                    <Text style={styles.keuanganFeatureItem}>• Catat pengeluaran dana</Text>
                    <Text style={styles.keuanganFeatureItem}>• Monitor saldo tersisa</Text>
                    <Text style={styles.keuanganFeatureItem}>• Laporan keuangan</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Batal"
                onPress={() => setKeuanganModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {seederLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingTitle}>Generating Data Warga</Text>
            <Text style={styles.loadingSubtitle}>
              Membuat {seederCount} akun dengan email sequential...
            </Text>
            <Text style={styles.loadingNote}>
              Next: user{seederStats.nextUserNumber}@gmail.com
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: lightTheme.accent,
  },
  logoIcon: {
    fontSize: 32,
    color: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  menuSection: {
    gap: 16,
    marginBottom: 40,
  },
  gridContainer: {
    marginBottom: 24,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  gridCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 0,
    minHeight: 160,
  },
  gridIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridIconText: {
    fontSize: 24,
    fontWeight: "600",
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: 'center',
    marginBottom: 8,
  },
  gridDesc: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.95,
    fontWeight: "500",
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
  },
  seederCard: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  seederCardLoading: {
    opacity: 0.7,
    borderColor: "#f97316",
    backgroundColor: "#fff7ed",
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuIconText: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  menuDesc: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 8,
  },
  seederStats: {
    marginTop: 4,
  },
  seederStatsText: {
    fontSize: 12,
    fontWeight: "500",
  },
  seederNextText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  menuArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 20,
    color: "#94a3b8",
  },
  logoutSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  logoutButton: {
    // borderColor will be set dynamically
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 20,
  },
  previewSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  previewEmail: {
    fontSize: 12,
    color: "#059669",
    fontFamily: "monospace",
    marginBottom: 2,
  },
  previewError: {
    fontSize: 12,
    color: "#ef4444",
    fontStyle: "italic",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingModal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    minWidth: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  loadingNote: {
    fontSize: 12,
    color: "#059669",
    textAlign: "center",
    fontWeight: "600",
  },
  // Solenoid Modal Styles
  solenoidStatusSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
  },
  statusSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  statusIndicator: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  statusIndicatorText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  countdownSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  countdownLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  countdownTime: {
    fontSize: 16,
    fontWeight: "700",
  },
  modeStatusText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
  },
  solenoidControlSection: {
    gap: 12,
  },
  controlSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  modalSolenoidButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalSolenoidIcon: {
    fontSize: 20,
  },
  modalSolenoidText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emergencyButton: {
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  // Keuangan Modal Styles
  keuanganDescription: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  keuanganOptionsContainer: {
    gap: 16,
  },
  keuanganOptionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  keuanganOptionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  keuanganOptionIconText: {
    fontSize: 24,
  },
  keuanganOptionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  keuanganOptionDesc: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  keuanganOptionFeatures: {
    alignItems: "flex-start",
    width: "100%",
  },
  keuanganFeatureItem: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    textAlign: "left",
  },
});

export default AdminHome;
