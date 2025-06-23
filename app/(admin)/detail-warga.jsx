import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Alert,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getUserProfile,
  deleteWarga,
  updateWargaRFID,
  deleteWargaRFID,
} from "../../services/userService";
import {
  startPairing,
  cancelPairing,
  getPairingStatus,
  listenToPairingData,
} from "../../services/pairingService";

export default function DetailWarga() {
  const { wargaId } = useLocalSearchParams();
  const [warga, setWarga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [pairingStatus, setPairingStatus] = useState(null);
  const [pairingLoading, setPairingLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadWargaData = async () => {
    setLoading(true);
    try {
      const result = await getUserProfile(wargaId);
      if (result.success) {
        setWarga(result.profile);
      } else {
        Alert.alert("Error", "Gagal memuat data warga");
        router.back();
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan saat memuat data");
      router.back();
    }
    setLoading(false);
  };

  const loadPairingStatus = async () => {
    try {
      const status = await getPairingStatus();
      setPairingStatus(status);
    } catch (error) {
      console.error("Error loading pairing status:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (wargaId) {
        loadWargaData();
        loadPairingStatus();
      }
    }, [wargaId])
  );

  useEffect(() => {
    if (!wargaId) return;

    const unsubscribe = listenToPairingData((rfidData) => {
      if (
        rfidData &&
        pairingStatus?.isActive &&
        pairingStatus?.wargaId === wargaId
      ) {
        handleRFIDReceived(rfidData);
      }
    });

    return () => unsubscribe && unsubscribe();
  }, [wargaId, pairingStatus]);

  useEffect(() => {
    const interval = setInterval(loadPairingStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRFIDReceived = async (rfidData) => {
    const wargaName = warga?.namaWarga || 'warga ini';
    
    Alert.alert(
      "RFID Terdeteksi",
      `RFID Code: ${rfidData.rfidCode}\n\nApakah Anda ingin menyimpan RFID ini untuk ${wargaName}?`,
      [
        {
          text: "Batal",
          style: "cancel",
          onPress: () => cancelPairing(),
        },
        {
          text: "Simpan",
          onPress: async () => {
            try {
              const result = await updateWargaRFID(wargaId, rfidData.rfidCode);
              await cancelPairing();
              if (result.success) {
                Alert.alert("Berhasil", "RFID berhasil dipasangkan!");
                loadWargaData();
                loadPairingStatus();
              } else {
                Alert.alert("Error", "Gagal menyimpan RFID");
              }
            } catch (error) {
              Alert.alert("Error", "Terjadi kesalahan saat menyimpan RFID");
            }
          },
        },
      ]
    );
  };

  const handleStartPairing = async () => {
    setPairingLoading(true);
    try {
      const result = await startPairing(wargaId);
      if (result.success) {
        Alert.alert(
          "Pairing Dimulai",
          "Silakan tap kartu RFID pada device ESP32. Pairing akan otomatis berhenti dalam 30 detik.",
          [{ text: "OK" }]
        );
        loadPairingStatus();
      } else {
        Alert.alert("Error", result.error || "Gagal memulai pairing");
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan saat memulai pairing");
    }
    setPairingLoading(false);
  };

  const handleCancelPairing = async () => {
    Alert.alert(
      "Batalkan Pairing",
      "Apakah Anda yakin ingin membatalkan pairing RFID?",
      [
        { text: "Tidak", style: "cancel" },
        {
          text: "Ya, Batalkan",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await cancelPairing();
              if (result.success) {
                Alert.alert(
                  "Pairing Dibatalkan",
                  "Pairing RFID telah dibatalkan"
                );
                loadPairingStatus();
              }
            } catch (error) {
              Alert.alert("Error", "Terjadi kesalahan saat membatalkan pairing");
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
    const wargaName = warga?.namaWarga || 'warga ini';
    const wargaEmail = warga?.email || 'email tidak tersedia';
    
    Alert.alert(
      "Hapus Warga",
      `Apakah Anda yakin ingin menghapus data ${wargaName}?\n\nTindakan ini akan:\n• Menghapus data warga dari sistem\n• Menonaktifkan akun warga (akun login tetap ada)\n• Email ${wargaEmail} tidak dapat digunakan lagi\n• Tidak dapat dibatalkan\n\nLanjutkan?`,
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
        const wargaName = warga?.namaWarga || 'warga';
        const wargaEmail = warga?.email || 'email tidak tersedia';
        
        Alert.alert(
          "Berhasil Dihapus! ✅",
          `Data warga ${wargaName} berhasil dihapus dari sistem.\n\n⚠️ Catatan: Email ${wargaEmail} tidak dapat digunakan untuk akun baru karena masih terdaftar di sistem autentikasi.`,
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
    const wargaName = warga?.namaWarga || 'warga ini';
    const rfidCode = warga?.rfidWarga || 'RFID tidak tersedia';
    
    Alert.alert(
      "Hapus RFID",
      `Apakah Anda yakin ingin menghapus RFID untuk ${wargaName}?\n\nRFID: ${rfidCode}\n\nSetelah dihapus, warga tidak akan bisa menggunakan kartu RFID untuk setoran.`,
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
    const wargaName = warga?.namaWarga || 'warga ini';
    const currentRfid = warga?.rfidWarga || 'tidak tersedia';
    
    Alert.alert(
      "Ganti RFID",
      `Apakah Anda ingin mengganti RFID untuk ${wargaName}?\n\nRFID saat ini: ${currentRfid}\n\nRFID lama akan diganti dengan yang baru.`,
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
      const result = await startPairing(wargaId);
      if (result.success) {
        Alert.alert(
          "Mode Pairing Aktif",
          "Silakan tempelkan kartu RFID baru pada ESP32.\n\nPairing akan timeout dalam 30 detik."
        );
        loadPairingStatus();
      } else {
        Alert.alert("Error", result.error || "Gagal memulai pairing");
      }
    } catch (error) {
      Alert.alert("Error", `Terjadi kesalahan: ${error.message}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={[Colors.primaryContainer, Colors.background]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={[styles.header, { backgroundColor: Colors.surface }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors.onSurface }]}>
            Detail Warga
          </Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: Colors.onSurface }]}>
            Memuat data warga...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  // Error state
  if (!warga) {
    return (
      <LinearGradient
        colors={[Colors.primaryContainer, Colors.background]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={[styles.header, { backgroundColor: Colors.surface }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors.onSurface }]}>
            Detail Warga
          </Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.errorContainer}>
          <View style={[styles.errorIcon, { backgroundColor: Colors.errorContainer }]}>
            <MaterialIcons name="person-off" size={40} color={Colors.onErrorContainer} />
          </View>
          <Text style={[styles.errorText, { color: Colors.error }]}>
            Data warga tidak ditemukan
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const isPairingActive = Boolean(pairingStatus?.isActive && pairingStatus?.wargaId === wargaId);
  const hasRfid = Boolean(warga?.rfidWarga);
  const canStartPairing = Boolean(warga && !warga.rfidWarga && !pairingStatus?.isActive);

  // Main render
  return (
    <LinearGradient
      colors={[Colors.primaryContainer, Colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.surface }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.onSurface }]}>
          Detail Warga
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: Colors.surface }]}>
            <View style={styles.cardContent}>
              <View style={styles.profileHeader}>
                <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
                  <Text style={[styles.avatarText, { color: Colors.onPrimary }]}>
                    {(warga?.namaWarga || 'W').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.namaWarga, { color: Colors.onSurface }]}>
                    {warga?.namaWarga || 'Nama Warga'}
                  </Text>
                  <Text style={[styles.wargaEmail, { color: Colors.onSurfaceVariant }]}>
                    {warga?.email || 'Email tidak tersedia'}
                  </Text>
                  <View style={[
                    styles.statusChip, 
                    { 
                      backgroundColor: hasRfid ? Colors.successContainer : Colors.warningContainer 
                    }
                  ]}>
                    <MaterialIcons 
                      name={hasRfid ? "check-circle" : "warning"} 
                      size={14} 
                      color={hasRfid ? Colors.onSuccessContainer : Colors.onWarningContainer} 
                    />
                    <Text style={[
                      styles.statusText, 
                      { 
                        color: hasRfid ? Colors.onSuccessContainer : Colors.onWarningContainer 
                      }
                    ]}>
                      {hasRfid ? "RFID Aktif" : "RFID Belum Ada"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.primary }]}
              onPress={handleEditWarga}
              disabled={deleting}
            >
              <MaterialIcons name="edit" size={20} color={Colors.onPrimary} />
              <Text style={[styles.actionButtonText, { color: Colors.onPrimary }]}>
                Edit Data
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeleteWarga}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={Colors.error} />
              ) : (
                <MaterialIcons name="delete" size={20} color={Colors.error} />
              )}
              <Text style={[styles.actionButtonText, { color: Colors.error }]}>
                {deleting ? "Menghapus..." : "Hapus Warga"}
              </Text>
            </TouchableOpacity>
          </View>

          {deleting && (
            <View style={[styles.deletingInfo, { backgroundColor: Colors.warningContainer }]}>
              <View style={styles.deletingContent}>
                <ActivityIndicator size="small" color={Colors.onWarningContainer} style={{ marginBottom: 8 }} />
                <Text style={[styles.deletingTitle, { color: Colors.onWarningContainer }]}>
                  Menghapus data warga dari sistem...
                </Text>
                <Text style={[styles.deletingSubtitle, { color: Colors.onWarningContainer }]}>
                  Mohon tunggu sebentar
                </Text>
              </View>
            </View>
          )}

          {/* Information Card */}
          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: Colors.onSurface }]}>Informasi Warga</Text>

            <View style={[styles.infoCard, { backgroundColor: Colors.surface }]}>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: Colors.onSurfaceVariant }]}>Nama Warga</Text>
                  <Text style={[styles.infoValue, { color: Colors.onSurface }]}>
                    {warga?.namaWarga || 'Belum diisi'}
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: Colors.outline }]} />

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: Colors.onSurfaceVariant }]}>Alamat</Text>
                  <Text style={[styles.infoValue, { color: Colors.onSurface }]}>
                    {warga?.alamat || 'Belum diisi'}
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: Colors.outline }]} />

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: Colors.onSurfaceVariant }]}>No HP</Text>
                  <Text style={[styles.infoValue, { color: Colors.onSurface }]}>
                    {warga?.noHpWarga || 'Belum diisi'}
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: Colors.outline }]} />

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: Colors.onSurfaceVariant }]}>Email</Text>
                  <Text style={[styles.infoValue, { color: Colors.onSurface }]}>
                    {warga?.email || 'Belum diisi'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* RFID Section */}
          <View style={styles.rfidSection}>
            <Text style={[styles.sectionTitle, { color: Colors.onSurface }]}>Status RFID</Text>

            <View style={[styles.rfidCard, { backgroundColor: Colors.surface }]}>
              <View style={styles.cardContent}>
                {/* RFID Status */}
                <View style={styles.rfidStatus}>
                  {hasRfid ? (
                    <View style={[styles.rfidActive, { backgroundColor: Colors.successContainer }]}>
                      <View style={styles.rfidStatusContent}>
                        <MaterialIcons name="check-circle" size={24} color={Colors.onSuccessContainer} />
                        <View style={styles.rfidInfo}>
                          <Text style={[styles.rfidTitle, { color: Colors.onSuccessContainer }]}>
                            RFID Terpasang
                          </Text>
                          <Text style={[styles.rfidSubtitle, { color: Colors.onSuccessContainer }]}>
                            {warga?.rfidWarga || 'RFID Code'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.rfidInactive, { backgroundColor: Colors.warningContainer }]}>
                      <View style={styles.rfidStatusContent}>
                        <MaterialIcons name="warning" size={24} color={Colors.onWarningContainer} />
                        <View style={styles.rfidInfo}>
                          <Text style={[styles.rfidTitle, { color: Colors.onWarningContainer }]}>
                            RFID Belum Terpasang
                          </Text>
                          <Text style={[styles.rfidSubtitle, { color: Colors.onWarningContainer }]}>
                            Silakan lakukan pairing RFID
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                {/* Pairing Active Status */}
                {isPairingActive && (
                  <View style={[styles.pairingActive, { backgroundColor: Colors.primaryContainer }]}>
                    <View style={styles.pairingContent}>
                      <ActivityIndicator size="small" color={Colors.onPrimaryContainer} style={{ marginBottom: 8 }} />
                      <Text style={[styles.pairingTitle, { color: Colors.onPrimaryContainer }]}>
                        Menunggu RFID...
                      </Text>
                      <Text style={[styles.pairingSubtitle, { color: Colors.onPrimaryContainer }]}>
                        Tap kartu RFID pada device ESP32
                      </Text>
                    </View>
                  </View>
                )}

                {/* RFID Action Buttons */}
                <View style={styles.rfidActions}>
                  {canStartPairing && (
                    <TouchableOpacity
                      style={[styles.rfidButton, { backgroundColor: Colors.primary }]}
                      onPress={handleStartPairing}
                      disabled={pairingLoading || deleting}
                    >
                      {pairingLoading ? (
                        <ActivityIndicator size="small" color={Colors.onPrimary} />
                      ) : (
                        <MaterialIcons name="wifi" size={20} color={Colors.onPrimary} />
                      )}
                      <Text style={[styles.rfidButtonText, { color: Colors.onPrimary }]}>
                        {pairingLoading ? "Memulai Pairing..." : "Mulai Pairing RFID"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isPairingActive && (
                    <TouchableOpacity
                      style={[styles.rfidButton, styles.cancelButton]}
                      onPress={handleCancelPairing}
                      disabled={deleting}
                    >
                      <MaterialIcons name="close" size={20} color={Colors.onSurface} />
                      <Text style={[styles.rfidButtonText, { color: Colors.onSurface }]}>
                        Batalkan Pairing
                      </Text>
                    </TouchableOpacity>
                  )}

                  {hasRfid && !isPairingActive && (
                    <View style={styles.rfidManagement}>
                      <TouchableOpacity
                        style={[styles.rfidButton, styles.rePairingButton]}
                        onPress={handleRePairing}
                        disabled={deleting}
                      >
                        <MaterialIcons name="swap-horiz" size={20} color={Colors.primary} />
                        <Text style={[styles.rfidButtonText, { color: Colors.primary }]}>
                          Ganti RFID
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.rfidButton, styles.deleteRFIDButton]}
                        onPress={handleDeleteRFID}
                        disabled={deleting}
                      >
                        <MaterialIcons name="delete" size={20} color={Colors.error} />
                        <Text style={[styles.rfidButtonText, { color: Colors.error }]}>
                          Hapus RFID
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    ...Shadows.sm,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  profileCard: {
    borderRadius: 16,
    marginBottom: 16,
    ...Shadows.md,
  },
  cardContent: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  namaWarga: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  wargaEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionSection: {
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  deletingInfo: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    ...Shadows.sm,
  },
  deletingContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  deletingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  deletingSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 16,
    ...Shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  rfidSection: {
    marginBottom: 24,
  },
  rfidCard: {
    borderRadius: 16,
    ...Shadows.sm,
  },
  rfidStatus: {
    marginBottom: 16,
  },
  rfidActive: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rfidInactive: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rfidStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rfidInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rfidTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rfidSubtitle: {
    fontSize: 14,
  },
  pairingActive: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    ...Shadows.sm,
  },
  pairingContent: {
    alignItems: 'center',
  },
  pairingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  pairingSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  rfidActions: {
    gap: 12,
  },
  rfidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  rfidButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  rfidManagement: {
    gap: 12,
    marginTop: 8,
  },
  rePairingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  deleteRFIDButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.error,
  },
});