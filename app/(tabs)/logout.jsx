import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { signOutUser } from "../../services/authService";
import { lightTheme } from "../../constants/Colors";

// Enhanced logout confirmation screen with visual components
export default function LogoutPage() {
  const router = useRouter();
  const { currentUser, userProfile, isAdmin } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar dari aplikasi?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await signOutUser();
              if (result.success) {
                router.replace("/role-selection");
              } else {
                Alert.alert(
                  "Gagal Logout",
                  "Terjadi kesalahan saat logout. Silakan coba lagi."
                );
              }
            } catch (error) {
              Alert.alert(
                "Error",
                "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."
              );
            }
          },
        },
      ]
    );
  };

  const handleGoBack = () => {
    router.back();
  };

  const getUserDisplayName = () => {
    if (userProfile?.namaWarga) {
      return userProfile.namaWarga;
    }
    if (currentUser?.email) {
      return currentUser.email;
    }
    return "Pengguna";
  };

  const getUserRole = () => {
    if (isAdmin) {
      return "Bendahara";
    }
    return "Warga";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </View>
          <Text style={styles.title}>Keluar dari Aplikasi</Text>
          <Text style={styles.subtitle}>
            Konfirmasikan untuk keluar dari sesi Anda
          </Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userInfoCard}>
          <View style={styles.userIconContainer}>
            <Text style={styles.userIcon}>
              {isAdmin ? "👨‍💼" : "👤"}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{getUserDisplayName()}</Text>
            <Text style={styles.userRole}>{getUserRole()}</Text>
            {currentUser?.email && (
              <Text style={styles.userEmail}>{currentUser.email}</Text>
            )}
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Anda akan keluar dari aplikasi dan perlu login kembali untuk
              mengakses fitur-fitur yang tersedia.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🔒</Text>
            <Text style={styles.infoText}>
              Data Anda akan tetap aman dan tersimpan dengan baik.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonIcon}>🚪</Text>
            <Text style={styles.logoutButtonText}>Keluar Sekarang</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonIcon}>↩️</Text>
            <Text style={styles.cancelButtonText}>Batal</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Terima kasih telah menggunakan Alfi App
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: lightTheme.primary,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: lightTheme.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutIcon: {
    fontSize: 32,
    color: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: lightTheme.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  userInfoCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: lightTheme.primary,
  },
  userIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#f1f5f9",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userIcon: {
    fontSize: 24,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: lightTheme.primary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: "#6b7280",
  },
  infoSection: {
    marginBottom: 32,
  },
  infoItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: lightTheme.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: lightTheme.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  cancelButtonText: {
    color: lightTheme.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
});