import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import Button from "../../components/ui/Button";
import { signOutUser } from "../../services/authService";
import { getColors, getThemeByRole } from "../../constants/Colors";

function Profile() {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { theme, loading: settingsLoading } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loggingOut, setLoggingOut] = useState(false);
  // Use consistent blue theme (#002245)
  const colors = {
    primary: "#002245",
    primaryLight: "#1E40AF",
    secondary: "#3B82F6",
    background: "#F8FAFC",
    white: "#FFFFFF",
    gray50: "#F9FAFB",
    gray100: "#F3F4F6",
    gray200: "#E5E7EB",
    gray300: "#D1D5DB",
    gray400: "#9CA3AF",
    gray500: "#6B7280",
    gray600: "#4B5563",
    gray700: "#374151",
    gray800: "#1F2937",
    gray900: "#111827",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    shadow: {
      color: "#000000",
    },
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
            Alert.alert("Gagal Logout", "Gagal keluar. Silakan coba lagi.");
          }
          setLoggingOut(false);
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    router.push("/(tabs)/edit-profile");
  };

  if (settingsLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.gray600 }]}>
            Memuat profil...
          </Text>
        </View>
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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* Cover Header Section */}
        <View style={[styles.coverSection, { backgroundColor: colors.primary }]}>
          <View style={styles.coverGradient}>
            <View style={styles.profileHeader}>
              <View
                style={[
                  styles.avatarContainer,
                  { backgroundColor: colors.white, borderColor: colors.white },
                ]}
              >
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  👤
                </Text>
              </View>
              <Text style={[styles.nameText, { color: colors.white }]}>
                {userProfile?.namaWarga || "Nama Warga"}
              </Text>
              <View style={[styles.roleContainer, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.roleText, { color: colors.white }]}>
                  ✨ Warga
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Cards Section */}
        <View style={styles.statsSection}>
          <View style={[styles.statsCard, { backgroundColor: colors.white, shadowColor: colors.shadow.color }]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {userProfile?.creditBalance || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.gray600 }]}>
                  💰 Saldo
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: userProfile?.rfidWarga ? colors.success : colors.error }]}>
                  {userProfile?.rfidWarga ? "✅" : "❌"}
                </Text>
                <Text style={[styles.statLabel, { color: colors.gray600 }]}>
                  🏷️ RFID
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.secondary }]}>
                  {userProfile?.role === "user" ? "👥" : "👑"}
                </Text>
                <Text style={[styles.statLabel, { color: colors.gray600 }]}>
                  🎭 Status
                </Text>
              </View>
            </View>
          </View>
        </View>

        {userProfile && (
          <View style={styles.contentSection}>
            {/* Personal Information Card */}
            <View
              style={[
                styles.modernCard,
                {
                  backgroundColor: colors.white,
                  shadowColor: colors.shadow.color,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.gray900 }]}>
                  📋 Informasi Personal
                </Text>
                <View style={[styles.cardBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.cardBadgeText, { color: colors.white }]}>
                    Profil
                  </Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.gray500 }]}>
                    👤 Nama Lengkap
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.gray900 }]}>
                    {userProfile.namaWarga}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.gray500 }]}>
                    📱 No HP
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.gray900 }]}>
                    {userProfile.noHpWarga}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.gray500 }]}>
                    ✉️ Email
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.gray900 }]}>
                    {userProfile.email}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.gray500 }]}>
                    🏠 Alamat
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.gray900 }]}>
                    {userProfile.alamat || "Belum diisi"}
                  </Text>
                </View>
              </View>
            </View>

            {/* RFID Status Card */}
            <View
              style={[
                styles.modernCard,
                {
                  backgroundColor: colors.white,
                  shadowColor: colors.shadow.color,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.gray900 }]}>
                  🏷️ Status RFID
                </Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: userProfile.rfidWarga ? colors.success : colors.error }
                ]}>
                  <Text style={[styles.statusBadgeText, { color: colors.white }]}>
                    {userProfile.rfidWarga ? "✅ Aktif" : "❌ Tidak Aktif"}
                  </Text>
                </View>
              </View>

              <View style={styles.rfidInfo}>
                <View style={[styles.rfidStatusCard, { 
                  backgroundColor: userProfile.rfidWarga ? colors.gray50 : colors.gray100,
                  borderColor: userProfile.rfidWarga ? colors.success : colors.error
                }]}>
                  <Text style={[styles.rfidStatusText, { 
                    color: userProfile.rfidWarga ? colors.success : colors.error 
                  }]}>
                    {userProfile.rfidWarga ? "🔗 RFID Terpasang" : "⚠️ RFID Belum Terpasang"}
                  </Text>
                  {userProfile.rfidWarga && (
                    <Text style={[styles.rfidCode, { color: colors.gray700 }]}>
                      Kode: {userProfile.rfidWarga}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Account Information Card */}
            <View
              style={[
                styles.modernCard,
                {
                  backgroundColor: colors.white,
                  shadowColor: colors.shadow.color,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.gray900 }]}>
                  🔐 Informasi Akun
                </Text>
                <View style={[styles.cardBadge, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.cardBadgeText, { color: colors.white }]}>
                    Sistem
                  </Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.gray500 }]}>
                    🆔 User ID
                  </Text>
                  <Text style={[styles.infoValue, styles.userId, { color: colors.gray900 }]}>
                    {userProfile.id}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.gray500 }]}>
                    🎭 Role
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.gray900 }]}>
                    {userProfile.role}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.gray500 }]}>
                    📅 Terdaftar
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.gray900 }]}>
                    {userProfile.createdAt ? 
                      new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString('id-ID') : 
                      "Tidak diketahui"
                    }
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: colors.primary }]}
            onPress={handleEditProfile}
          >
            <Text style={[styles.primaryActionText, { color: colors.white }]}>
              ✏️ Edit Profil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryAction, { borderColor: colors.error }]}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            <Text style={[styles.secondaryActionText, { color: colors.error }]}>
              {loggingOut ? "⏳ Sedang Keluar..." : "🚪 Keluar"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  
  // Cover Header Section
  coverSection: {
    height: 200,
    position: "relative",
    marginBottom: -40,
  },
  coverGradient: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 40,
  },
  nameText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  roleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },

  // Content Section
  contentSection: {
    paddingHorizontal: 24,
  },
  modernCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  cardBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Info Grid
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },

  // RFID Section
  rfidInfo: {
    marginTop: 8,
  },
  rfidStatusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  rfidStatusText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  rfidCode: {
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "500",
  },

  // Actions Section
  actionsSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  primaryAction: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryAction: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Legacy styles for compatibility
  userId: {
    fontFamily: "monospace",
    fontSize: 14,
  },
});

export default Profile;
