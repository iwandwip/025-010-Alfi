import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  getUserProfile,
  deleteWarga,
  updateWargaRFID,
  deleteWargaRFID,
} from "../../services/userService";
import {
  startRFIDPairingWithTimeout,
  subscribeToRFIDDetection,
  completePairingSession,
  getMode,
  clearModeTimeout,
  resetToIdle
} from "../../services/rtdbModeService";

export default function DetailWarga() {
  const { wargaId } = useLocalSearchParams();
  const [warga, setWarga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [pairingActive, setPairingActive] = useState(false);
  const [pairingLoading, setPairingLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState('idle');
  const [pairingTimeoutId, setPairingTimeoutId] = useState(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadWargaData = async () => {
    setLoading(true);
    const result = await getUserProfile(wargaId);
    if (result.success) {
      setWarga(result.profile);
    } else {
      Alert.alert("Error", "Gagal memuat data warga");
      router.back();
    }
    setLoading(false);
  };

  const checkCurrentMode = async () => {
    try {
      const mode = await getMode();
      setCurrentMode(mode);
      setPairingActive(mode === 'pairing');
    } catch (error) {
      console.error('Error checking mode:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadWargaData();
      checkCurrentMode();
    }, [wargaId])
  );

  useEffect(() => {
    // Revolutionary mode-based RFID detection (ultra-simple!)
    const unsubscribe = subscribeToRFIDDetection((rfidCode) => {
      if (pairingActive) {
        handleRFIDReceived(rfidCode);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [pairingActive]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (pairingTimeoutId) {
        clearModeTimeout(pairingTimeoutId);
      }
    };
  }, [pairingTimeoutId]);

  const handleRFIDReceived = async (rfidCode) => {
    Alert.alert(
      "RFID Terdeteksi! 🎉",
      `RFID Code: ${rfidCode}\n\nApakah Anda ingin menyimpan RFID ini untuk ${warga?.namaWarga}?`,
      [
        {
          text: "Batal",
          style: "cancel",
          onPress: async () => {
            await handleCancelPairing();
          },
        },
        {
          text: "Simpan",
          onPress: async () => {
            try {
              // Save to Firestore (permanent storage)
              const result = await updateWargaRFID(wargaId, rfidCode);
              
              // Complete mode-based session and cleanup RTDB
              await completePairingSession();
              
              // Clear timeout
              if (pairingTimeoutId) {
                clearModeTimeout(pairingTimeoutId);
                setPairingTimeoutId(null);
              }
              
              setPairingActive(false);
              setCurrentMode('idle');
              
              if (result.success) {
                Alert.alert("Berhasil! ✅", "RFID berhasil dipasangkan dengan sistem mode-based!");
                loadWargaData();
              } else {
                Alert.alert("Error", "Gagal menyimpan RFID");
              }
            } catch (error) {
              Alert.alert("Error", `Terjadi kesalahan: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const handleStartPairing = async () => {
    setPairingLoading(true);
    
    try {
      // Revolutionary mode-based pairing with automatic timeout!
      const result = await startRFIDPairingWithTimeout(30);
      
      if (result.success) {
        setPairingTimeoutId(result.timeoutId);
        setPairingActive(true);
        setCurrentMode('pairing');
        
        Alert.alert(
          "Mode Pairing Aktif! 🚀",
          "ESP32 telah diatur ke mode pairing via RTDB.\n\n🔥 Sistem mode-based siap!\n• Silakan tap kartu RFID pada ESP32\n• Timeout otomatis dalam 30 detik\n• Real-time detection aktif",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "Gagal memulai mode pairing");
      }
    } catch (error) {
      Alert.alert("Error", `Terjadi kesalahan: ${error.message}`);
    }
    
    setPairingLoading(false);
  };

  const handleCancelPairing = async () => {
    Alert.alert(
      "Batalkan Mode Pairing",
      "Apakah Anda yakin ingin membatalkan mode pairing RFID?",
      [
        { text: "Tidak", style: "cancel" },
        {
          text: "Ya, Batalkan",
          style: "destructive",
          onPress: async () => {
            try {
              // Reset to idle mode (self-cleaning)
              await resetToIdle();
              
              // Clear timeout
              if (pairingTimeoutId) {
                clearModeTimeout(pairingTimeoutId);
                setPairingTimeoutId(null);
              }
              
              setPairingActive(false);
              setCurrentMode('idle');
              
              Alert.alert(
                "Mode Pairing Dibatalkan ✅",
                "Sistem telah kembali ke mode idle"
              );
            } catch (error) {
              Alert.alert("Error", `Gagal membatalkan pairing: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const handleEditWarga = () => {
    router.push({
      pathname: "/(admin)/edit-warga",
      params: { wargaId: wargaId },
    });
  };

  const handleDeleteWarga = () => {
    Alert.alert(
      "Hapus Warga",
      `Apakah Anda yakin ingin menghapus data ${warga?.namaWarga}?\n\nTindakan ini akan:\n• Menghapus data warga dari sistem\n• Menonaktifkan akun warga (akun login tetap ada)\n• Email ${warga?.email} tidak dapat digunakan lagi\n• Tidak dapat dibatalkan\n\nLanjutkan?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Hapus",
          style: "destructive",
          onPress: confirmDeleteWarga,
        },
      ]
    );
  };

  const confirmDeleteWarga = async () => {
    setDeleting(true);

    try {
      const result = await deleteWarga(wargaId);

      if (result.success) {
        Alert.alert(
          "Berhasil Dihapus! ✅",
          `Data warga ${warga?.namaWarga} berhasil dihapus dari sistem.\n\n⚠️ Catatan: Email ${warga?.email} tidak dapat digunakan untuk akun baru karena masih terdaftar di sistem autentikasi.`,
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(admin)/daftar-warga");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", `Gagal menghapus data warga: ${result.error}`);
      }
    } catch (error) {
      Alert.alert("Error", `Terjadi kesalahan tidak terduga: ${error.message}`);
    }

    setDeleting(false);
  };

  const handleDeleteRFID = () => {
    Alert.alert(
      "Hapus RFID",
      `Apakah Anda yakin ingin menghapus RFID untuk ${warga?.namaWarga}?\n\nRFID: ${warga?.rfidWarga}\n\nSetelah dihapus, warga tidak akan bisa menggunakan kartu RFID untuk pembayaran.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Hapus",
          style: "destructive",
          onPress: confirmDeleteRFID,
        },
      ]
    );
  };

  const confirmDeleteRFID = async () => {
    try {
      const result = await deleteWargaRFID(wargaId);
      if (result.success) {
        Alert.alert("Berhasil", "RFID berhasil dihapus!");
        loadWargaData();
      } else {
        Alert.alert("Error", `Gagal menghapus RFID: ${result.error}`);
      }
    } catch (error) {
      Alert.alert("Error", `Terjadi kesalahan: ${error.message}`);
    }
  };

  const handleRePairing = () => {
    Alert.alert(
      "Ganti RFID",
      `Apakah Anda ingin mengganti RFID untuk ${warga?.namaWarga}?\n\nRFID saat ini: ${warga?.rfidWarga}\n\nRFID lama akan diganti dengan yang baru.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Ganti",
          onPress: startRePairing,
        },
      ]
    );
  };

  const startRePairing = async () => {
    try {
      // Revolutionary mode-based re-pairing
      const result = await startRFIDPairingWithTimeout(30);
      
      if (result.success) {
        setPairingTimeoutId(result.timeoutId);
        setPairingActive(true);
        setCurrentMode('pairing');
        
        Alert.alert(
          "Mode Re-pairing Aktif! 🔄",
          "ESP32 siap menerima kartu RFID baru via mode-based system.\n\n• Tempelkan kartu RFID baru pada ESP32\n• RFID lama akan diganti otomatis\n• Timeout dalam 30 detik"
        );
      } else {
        Alert.alert("Error", "Gagal memulai mode re-pairing");
      }
    } catch (error) {
      Alert.alert("Error", `Terjadi kesalahan: ${error.message}`);
    }
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
          <Text style={styles.headerTitle}>Detail Warga</Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner text="Memuat data warga..." />
        </View>
      </SafeAreaView>
    );
  }

  if (!warga) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Warga</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Data warga tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canStartPairing = !warga.rfidWarga && !pairingActive;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Warga</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.profileName}>{warga.namaWarga}</Text>
          <Text style={styles.profileId}>ID: {warga.id}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Aktif</Text>
          </View>
        </View>

        {deleting && (
          <View style={styles.deletingCard}>
            <Text style={styles.deletingText}>
              🔄 Menghapus data warga dari sistem...
            </Text>
            <Text style={styles.deletingSubtext}>Mohon tunggu sebentar</Text>
          </View>
        )}

        {/* Personal Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>👤 Informasi Pribadi</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nama Lengkap</Text>
              <Text style={styles.infoValue}>{warga.namaWarga}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Alamat</Text>
              <Text style={styles.infoValue}>{warga.alamat}</Text>
            </View>
          </View>
        </View>

        {/* Contact Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📞 Informasi Kontak</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>No. HP</Text>
              <Text style={styles.infoValue}>{warga.noHpWarga}</Text>
            </View>
            <View style={[styles.infoRow, styles.lastRow]}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{warga.email}</Text>
            </View>
          </View>
        </View>

        {/* Account Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>💰 Informasi Akun</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Saldo Kredit</Text>
              <Text style={styles.creditValue}>
                Rp {(warga.creditBalance || 0).toLocaleString('id-ID')}
              </Text>
            </View>
            <View style={[styles.infoRow, styles.lastRow]}>
              <Text style={styles.infoLabel}>Status Akun</Text>
              <View style={styles.activeStatus}>
                <Text style={styles.activeStatusText}>Aktif</Text>
              </View>
            </View>
          </View>
        </View>

        {/* RFID Status Card */}
        <View style={styles.rfidCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📱 Status RFID</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.rfidStatus}>
              {warga.rfidWarga ? (
                <View style={styles.rfidActive}>
                  <Text style={styles.rfidIcon}>✅</Text>
                  <View style={styles.rfidInfo}>
                    <Text style={styles.rfidLabel}>RFID Terpasang</Text>
                    <Text style={styles.rfidCode}>{warga.rfidWarga}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.rfidInactive}>
                  <Text style={styles.rfidIcon}>⚠️</Text>
                  <View style={styles.rfidInfo}>
                    <Text style={styles.rfidLabel}>RFID Belum Terpasang</Text>
                    <Text style={styles.rfidDesc}>
                      Silakan lakukan pairing RFID
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {pairingActive && (
              <View style={styles.pairingActive}>
                <Text style={styles.pairingText}>🔥 Mode Pairing Aktif (RTDB)</Text>
                <Text style={styles.pairingDesc}>
                  ESP32 dalam mode: {currentMode} | Tap kartu RFID sekarang
                </Text>
              </View>
            )}

            <View style={styles.rfidActions}>
              {canStartPairing && (
                <Button
                  title={
                    pairingLoading ? "Memulai Mode Pairing..." : "🚀 Mulai Mode Pairing (RTDB)"
                  }
                  onPress={handleStartPairing}
                  disabled={pairingLoading || deleting}
                  style={styles.pairingButton}
                />
              )}

              {pairingActive && (
                <Button
                  title="❌ Batalkan Mode Pairing"
                  onPress={handleCancelPairing}
                  variant="outline"
                  style={styles.cancelButton}
                  disabled={deleting}
                />
              )}

              {warga.rfidWarga && !pairingActive && (
                <View style={styles.rfidManagement}>
                  <Button
                    title="🔄 Ganti RFID"
                    onPress={handleRePairing}
                    variant="secondary"
                    style={styles.rePairingButton}
                    disabled={deleting}
                  />
                  <Button
                    title="🗑️ Hapus RFID"
                    onPress={handleDeleteRFID}
                    variant="outline"
                    style={styles.deleteRFIDButton}
                    disabled={deleting}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Card */}
      <View style={styles.floatingActionCard}>
        <View style={styles.actionButtons}>
          <Button
            title="✏️ Edit Data"
            onPress={handleEditWarga}
            variant="secondary"
            style={styles.editButton}
            disabled={deleting}
          />
          <Button
            title={deleting ? "Menghapus..." : "🗑️ Hapus Warga"}
            onPress={handleDeleteWarga}
            variant="outline"
            style={styles.deleteButton}
            disabled={deleting}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#002245",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  
  // Profile Header Card
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#002245",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.22,
  },
  avatarText: {
    fontSize: 36,
    color: "#fff",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#002245",
    marginBottom: 4,
    textAlign: "center",
  },
  profileId: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "monospace",
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Delete Warning Card
  deletingCard: {
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f59e0b",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
  },
  deletingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400e",
    marginBottom: 8,
    textAlign: "center",
  },
  deletingSubtext: {
    fontSize: 14,
    color: "#92400e",
    textAlign: "center",
    lineHeight: 20,
  },

  // Information Cards
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
  },
  cardHeader: {
    backgroundColor: "#002245",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#1e293b",
    flex: 2,
    textAlign: "right",
    fontWeight: "500",
  },
  creditValue: {
    fontSize: 14,
    color: "#10b981",
    flex: 2,
    textAlign: "right",
    fontWeight: "600",
  },
  activeStatus: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatusText: {
    color: "#16a34a",
    fontSize: 12,
    fontWeight: "600",
  },

  // RFID Card
  rfidCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
  },
  rfidStatus: {
    marginBottom: 16,
  },
  rfidActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    padding: 12,
    borderRadius: 8,
  },
  rfidInactive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
  },
  rfidIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  rfidInfo: {
    flex: 1,
  },
  rfidLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  rfidCode: {
    fontSize: 14,
    color: "#059669",
    fontFamily: "monospace",
  },
  rfidDesc: {
    fontSize: 14,
    color: "#92400e",
  },
  pairingActive: {
    backgroundColor: "#dbeafe",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  pairingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 4,
  },
  pairingDesc: {
    fontSize: 14,
    color: "#1e40af",
    textAlign: "center",
  },
  rfidActions: {
    gap: 12,
  },
  pairingButton: {
    backgroundColor: "#002245",
  },
  cancelButton: {
    borderColor: "#ef4444",
  },
  rfidManagement: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  rePairingButton: {
    flex: 1,
  },
  deleteRFIDButton: {
    flex: 1,
  },

  // Floating Action Card
  floatingActionCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4.84,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#002245",
  },
  deleteButton: {
    flex: 1,
    borderColor: "#ef4444",
  },
});
