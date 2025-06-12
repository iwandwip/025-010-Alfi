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
import Button from "../../components/ui/Button";
import { signOutUser } from "../../services/authService";
import { seederService } from "../../services/seederService";

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
      "Generate Data Santri",
      `Akan membuat ${count} akun wali santri baru:\n${emailList.join(
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

                let message = `✅ Berhasil membuat ${result.totalCreated} akun santri!\n\n`;

                result.created.forEach((user, index) => {
                  message += `${index + 1}. ${user.namaSantri}\n`;
                  message += `   Email: ${user.email}\n`;
                  message += `   Wali: ${user.namaWali}\n`;
                  message += `   RFID: ${user.rfidSantri}\n\n`;
                });

                message += `Password semua akun: admin123`;

                if (result.totalErrors > 0) {
                  message += `\n\n⚠️ ${result.totalErrors} akun gagal dibuat`;
                }

                showGeneralNotification(
                  "Seeder Berhasil",
                  `Berhasil membuat ${result.totalCreated} akun santri baru`,
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

  const handleTambahSantri = () => {
    router.push("/(admin)/tambah-santri");
  };

  const handleDaftarSantri = () => {
    router.push("/(admin)/daftar-santri");
  };

  const handleTimelineManager = () => {
    router.push("/(admin)/timeline-manager");
  };

  const handleCekPembayaran = () => {
    router.push("/(admin)/payment-status");
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
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
            colors={["#3b82f6"]}
            tintColor="#3b82f6"
            title="Tarik untuk memuat ulang..."
            titleColor="#64748b"
          />
        }
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>Dashboard Admin</Text>
          <Text style={styles.subtitle}>TPQ Ibadurrohman</Text>
          {userProfile && (
            <Text style={styles.welcomeText}>
              Selamat datang, {userProfile.nama}
            </Text>
          )}
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={[styles.menuCard, styles.primaryCard]}
            onPress={handleTambahSantri}
            activeOpacity={0.8}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>👤</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Tambah Data Santri</Text>
              <Text style={styles.menuDesc}>
                Daftarkan santri baru dan buat akun wali santri
              </Text>
            </View>
            <View style={styles.menuArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, styles.secondaryCard]}
            onPress={handleDaftarSantri}
            activeOpacity={0.8}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>📋</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Daftar Santri</Text>
              <Text style={styles.menuDesc}>
                Lihat dan kelola data santri yang terdaftar
              </Text>
            </View>
            <View style={styles.menuArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, styles.tertiaryCard]}
            onPress={handleTimelineManager}
            activeOpacity={0.8}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>📅</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Timeline Manager</Text>
              <Text style={styles.menuDesc}>
                Kelola timeline dan pembayaran bisyaroh
              </Text>
            </View>
            <View style={styles.menuArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, styles.quaternaryCard]}
            onPress={handleCekPembayaran}
            activeOpacity={0.8}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>💰</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Cek Status Pembayaran</Text>
              <Text style={styles.menuDesc}>
                Lihat status pembayaran bisyaroh semua santri
              </Text>
            </View>
            <View style={styles.menuArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuCard,
              styles.seederCard,
              seederLoading && styles.seederCardLoading,
            ]}
            onPress={handleSeeder}
            activeOpacity={0.8}
            disabled={seederLoading}
          >
            <View style={styles.menuIcon}>
              {seederLoading ? (
                <ActivityIndicator size={24} color="#ef4444" />
              ) : (
                <Text style={styles.menuIconText}>🎲</Text>
              )}
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                {seederLoading ? "Generating Data..." : "Generate Data Santri"}
              </Text>
              <Text style={styles.menuDesc}>
                {seederLoading
                  ? "Sedang membuat akun santri dengan data sequential..."
                  : "Buat akun santri dengan email sequential untuk testing"}
              </Text>
              <View style={styles.seederStats}>
                <Text style={styles.seederStatsText}>
                  Total Santri: {seederStats.total} | Generated:{" "}
                  {seederStats.seederUsers}
                </Text>
                <Text style={styles.seederNextText}>
                  Next: user{seederStats.nextUserNumber}@gmail.com
                </Text>
              </View>
            </View>
            <View style={styles.menuArrow}>
              <Text
                style={[styles.arrowText, seederLoading && { opacity: 0.5 }]}
              >
                {seederLoading ? "⏳" : "→"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.logoutSection}>
          <Button
            title={loggingOut ? "Sedang Keluar..." : "Keluar"}
            onPress={handleLogout}
            variant="outline"
            disabled={loggingOut}
            style={styles.logoutButton}
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
              <Text style={styles.modalTitle}>Generate Data Santri</Text>
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

      {seederLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color="#ef4444" />
            <Text style={styles.loadingTitle}>Generating Data Santri</Text>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  menuSection: {
    gap: 16,
    marginBottom: 40,
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
  primaryCard: {
    borderColor: "#3b82f6",
  },
  secondaryCard: {
    borderColor: "#10b981",
  },
  tertiaryCard: {
    borderColor: "#f59e0b",
  },
  quaternaryCard: {
    borderColor: "#8b5cf6",
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
    backgroundColor: "#f1f5f9",
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
    color: "#ef4444",
    fontWeight: "500",
  },
  seederNextText: {
    fontSize: 11,
    color: "#059669",
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
    borderColor: "#ef4444",
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
});

export default AdminHome;
