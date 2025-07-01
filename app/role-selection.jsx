import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lightTheme } from "../constants/Colors";

export default function RoleSelection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleAdminPress = () => {
    router.push("/(auth)/admin-login");
  };

  const handleWargaPress = () => {
    router.push("/(auth)/warga-login");
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Simple Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoIcon}>💰</Text>
            </View>
            <Text style={styles.appTitle}>Alfi</Text>
            <Text style={styles.appSubtitle}>Sistem Jimpitan Warga</Text>
          </View>
        </View>

        {/* Simple Role Selection */}
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionTitle}>Masuk Sebagai</Text>
          
          <TouchableOpacity
            style={[styles.roleButton, styles.adminButton]}
            onPress={handleAdminPress}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonIcon}>
                <Text style={styles.iconText}>👨‍💼</Text>
              </View>
              <View style={styles.buttonText}>
                <Text style={styles.roleTitle}>Bendahara</Text>
                <Text style={styles.roleDesc}>Kelola data dan pembayaran</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, styles.wargaButton]}
            onPress={handleWargaPress}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonIcon}>
                <Text style={styles.iconText}>👨‍👩‍👧‍👦</Text>
              </View>
              <View style={styles.buttonText}>
                <Text style={styles.roleTitle}>Warga</Text>
                <Text style={styles.roleDesc}>Bayar dan pantau jimpitan</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sistem Jimpitan</Text>
          <Text style={styles.footerSubtext}>Pengelolaan Keuangan Warga</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 60,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: lightTheme.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: lightTheme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 3,
    borderColor: lightTheme.accent,
  },
  logoIcon: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: lightTheme.primary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 16,
    color: lightTheme.gray500,
    fontWeight: "400",
  },
  selectionContainer: {
    marginBottom: 40,
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 32,
  },
  roleButton: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: lightTheme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    transform: [{ scale: 1 }],
  },
  adminButton: {
    borderColor: lightTheme.primary,
  },
  wargaButton: {
    borderColor: lightTheme.primary,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  buttonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: lightTheme.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
    borderWidth: 2,
    borderColor: lightTheme.primary,
  },
  iconText: {
    fontSize: 20,
  },
  buttonText: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 18,
  },
  arrow: {
    fontSize: 20,
    color: lightTheme.primary,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: "#94a3b8",
  },
});
