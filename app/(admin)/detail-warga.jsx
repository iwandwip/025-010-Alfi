import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Alert,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import Button from '../../components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, SlideInUp, SlideInRight } from 'react-native-reanimated';
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
    const result = await getUserProfile(wargaId);
    if (result.success) {
      setWarga(result.profile);
    } else {
      Alert.alert("Error", "Gagal memuat data warga");
      router.back();
    }
    setLoading(false);
  };

  const loadPairingStatus = async () => {
    const status = await getPairingStatus();
    setPairingStatus(status);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadWargaData();
      loadPairingStatus();
    }, [wargaId])
  );

  useEffect(() => {
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
    Alert.alert(
      "RFID Terdeteksi",
      `RFID Code: ${rfidData.rfidCode}\n\nApakah Anda ingin menyimpan RFID ini untuk ${warga?.namaWarga}?`,
      [
        {
          text: "Batal",
          style: "cancel",
          onPress: () => cancelPairing(),
        },
        {
          text: "Simpan",
          onPress: async () => {
            const result = await updateWargaRFID(wargaId, rfidData.rfidCode);
            await cancelPairing();
            if (result.success) {
              Alert.alert("Berhasil", "RFID berhasil dipasangkan!");
              loadWargaData();
            } else {
              Alert.alert("Error", "Gagal menyimpan RFID");
            }
          },
        },
      ]
    );
  };

  const handleStartPairing = async () => {
    setPairingLoading(true);
    const result = await startPairing(wargaId);
    if (result.success) {
      Alert.alert(
        "Pairing Dimulai",
        "Silakan tap kartu RFID pada device ESP32. Pairing akan otomatis berhenti dalam 30 detik.",
        [{ text: "OK" }]
      );
      loadPairingStatus();
    } else {
      Alert.alert("Error", result.error);
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
            const result = await cancelPairing();
            if (result.success) {
              Alert.alert(
                "Pairing Dibatalkan",
                "Pairing RFID telah dibatalkan"
              );
              loadPairingStatus();
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
      `Apakah Anda yakin ingin menghapus RFID untuk ${warga?.namaWarga}?\n\nRFID: ${warga?.rfidWarga}\n\nSetelah dihapus, warga tidak akan bisa menggunakan kartu RFID untuk setoran.`,
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

  if (loading) {
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
          <Text style={styles.headerTitle}>
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

  if (!warga) {
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
          <Text style={styles.headerTitle}>
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

  const isPairingActive =
    pairingStatus?.isActive && pairingStatus?.wargaId === wargaId;
  const canStartPairing = !warga.rfidWarga && !pairingStatus?.isActive;

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
        <Text style={styles.headerTitle}>
          Detail Warga
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          {/* Profile Card */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <View style={[styles.profileCard, { backgroundColor: Colors.surface }, Shadows.md]}>
              <View style={styles.cardContent}>
                <View style={styles.profileSection}>
                  <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
                    <Text style={[styles.avatarText, { color: Colors.onPrimary }]}>
                      {warga.namaWarga?.charAt(0)?.toUpperCase() || 'W'}
                    </Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={[styles.namaWarga, { color: Colors.onSurface, fontWeight: 'bold' }]}>{warga.namaWarga}</Text>
                    <Text style={[styles.wargaId, { color: Colors.onSurfaceVariant }]}>ID: {warga.id}</Text>
                    <View style={[
                      styles.statusChip, 
                      { 
                        backgroundColor: warga.rfidWarga ? Colors.successContainer : Colors.warningContainer 
                      }
                    ]}>
                      <MaterialIcons 
                        name={warga.rfidWarga ? "check-circle" : "warning"} 
                        size={14} 
                        color={warga.rfidWarga ? Colors.onSuccessContainer : Colors.onWarningContainer} 
                      />
                      <Text style={[
                        styles.statusText, 
                        { 
                          color: warga.rfidWarga ? Colors.onSuccessContainer : Colors.onWarningContainer 
                        }
                      ]}>
                        {warga.rfidWarga ? "RFID OK" : "No RFID"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={SlideInUp.delay(200)} style={styles.actionSection}>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="pencil"
                onPress={handleEditWarga}
                style={styles.editButton}
                disabled={deleting}
              >
                Edit Data
              </Button>
              <Button
                mode="outlined"
                icon="delete"
                onPress={handleDeleteWarga}
                style={styles.deleteButton}
                disabled={deleting}
                loading={deleting}
              >
                {deleting ? "Menghapus..." : "Hapus Warga"}
              </Button>
            </View>
          </Animated.View>

          {deleting && (
            <Animated.View entering={SlideInUp.delay(300)}>
              <View style={[styles.deletingInfo, { backgroundColor: Colors.warningContainer }, Shadows.sm]}>
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
            </Animated.View>
          )}

          {/* Information Card */}
          <Animated.View entering={SlideInRight.delay(300)} style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: Colors.onSurface }]}>Informasi Warga</Text>

            <View style={[styles.infoCard, { backgroundColor: Colors.surface }, Shadows.sm]}>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: Colors.onSurfaceVariant }]}>Nama Warga:</Text>
                  <Text style={[styles.infoValue, { color: Colors.onSurface }]}>{warga.namaWarga}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: Colors.outline }]} />

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: Colors.onSurfaceVariant }]}>Alamat:</Text>
                  <Text style={[styles.infoValue, { color: Colors.onSurface }]}>{warga.alamat || 'Belum diisi'}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: Colors.outline }]} />

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: Colors.onSurfaceVariant }]}>No HP Warga:</Text>
                  <Text style={[styles.infoValue, { color: Colors.onSurface }]}>{warga.noHpWarga}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: Colors.outline }]} />

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: Colors.onSurfaceVariant }]}>Email Warga:</Text>
                  <Text style={[styles.infoValue, { color: Colors.onSurface }]}>{warga.email}</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* RFID Section */}
          <Animated.View entering={SlideInRight.delay(400)} style={styles.rfidSection}>
            <Text style={[styles.sectionTitle, { color: Colors.onSurface }]}>Status RFID</Text>

            <View style={[styles.rfidCard, { backgroundColor: Colors.surface }, Shadows.sm]}>
              <View style={styles.cardContent}>
                <View style={styles.rfidStatus}>
                  {warga.rfidWarga ? (
                    <View style={[styles.rfidActive, { backgroundColor: Colors.successContainer }, Shadows.sm]}>
                      <View style={styles.rfidStatusContent}>
                        <View style={[styles.rfidIcon, { backgroundColor: Colors.success }]}>
                          <MaterialIcons name="check-circle" size={24} color={Colors.onSuccess} />
                        </View>
                        <View style={styles.rfidInfo}>
                          <Text style={[styles.rfidTitle, { color: Colors.onSuccessContainer }]}>RFID Terpasang</Text>
                          <Text style={[styles.rfidSubtitle, { color: Colors.onSuccessContainer }]}>{warga.rfidWarga}</Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.rfidInactive, { backgroundColor: Colors.warningContainer }, Shadows.sm]}>
                      <View style={styles.rfidStatusContent}>
                        <View style={[styles.rfidIcon, { backgroundColor: Colors.warning }]}>
                          <MaterialIcons name="warning" size={24} color={Colors.onWarning} />
                        </View>
                        <View style={styles.rfidInfo}>
                          <Text style={[styles.rfidTitle, { color: Colors.onWarningContainer }]}>RFID Belum Terpasang</Text>
                          <Text style={[styles.rfidSubtitle, { color: Colors.onWarningContainer }]}>
                            Silakan lakukan pairing RFID
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                {isPairingActive && (
                  <View style={[styles.pairingActive, { backgroundColor: Colors.primaryContainer }, Shadows.sm]}>
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

                <View style={styles.rfidActions}>
                  {canStartPairing && (
                    <Button
                      mode="contained"
                      icon="wifi"
                      onPress={handleStartPairing}
                      disabled={pairingLoading || deleting}
                      loading={pairingLoading}
                      style={styles.pairingButton}
                    >
                      {pairingLoading ? "Memulai Pairing..." : "Mulai Pairing RFID"}
                    </Button>
                  )}

                  {isPairingActive && (
                    <Button
                      mode="outlined"
                      icon="close"
                      onPress={handleCancelPairing}
                      style={styles.cancelButton}
                      disabled={deleting}
                    >
                      Batalkan Pairing
                    </Button>
                  )}

                  {warga.rfidWarga && !isPairingActive && (
                    <View style={styles.rfidManagement}>
                      <Button
                        mode="contained-tonal"
                        icon="swap-horizontal"
                        onPress={handleRePairing}
                        style={styles.rePairingButton}
                        disabled={deleting}
                      >
                        Ganti RFID
                      </Button>
                      <Button
                        mode="outlined"
                        icon="delete"
                        onPress={handleDeleteRFID}
                        style={styles.deleteRFIDButton}
                        disabled={deleting}
                      >
                        Hapus RFID
                      </Button>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 48,
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
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    padding: 4,
  },
  profileCard: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
  },
  cardContent: {
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  namaWarga: {
    fontSize: 20,
    marginBottom: 4,
  },
  wargaId: {
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
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
  deletingInfo: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  deletingContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  deletingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deletingSubtitle: {
    fontSize: 14,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  rfidSection: {
    marginBottom: 24,
  },
  rfidCard: {
    borderRadius: 16,
    padding: 16,
  },
  rfidStatus: {
    marginBottom: 16,
  },
  rfidActive: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  rfidInactive: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  rfidStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rfidIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rfidInfo: {
    flex: 1,
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
  },
  pairingContent: {
    alignItems: 'center',
  },
  pairingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pairingSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  rfidActions: {
    gap: 12,
  },
  pairingButton: {
  },
  cancelButton: {
  },
  rfidManagement: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  rePairingButton: {
    flex: 1,
  },
  deleteRFIDButton: {
    flex: 1,
  },
});
