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

export default function RoleSelection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleAdminPress = () => {
    router.push("/(auth)/admin-login");
  };

  const handleWaliPress = () => {
    router.push("/(auth)/wali-login");
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Smart Bisyaroh</Text>
          <Text style={styles.subtitle}>
            Sistem Administrasi Pembayaran TPQ Ibadurrohman
          </Text>
        </View>

        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>🕌</Text>
          </View>
        </View>

        <View style={styles.roleSection}>
          <Text style={styles.roleTitle}>Pilih Peran Anda</Text>

          <TouchableOpacity
            style={[styles.roleCard, styles.adminCard]}
            onPress={handleAdminPress}
            activeOpacity={0.8}
          >
            <View style={styles.roleIcon}>
              <Text style={styles.roleIconText}>👨‍💼</Text>
            </View>
            <View style={styles.roleContent}>
              <Text style={styles.roleCardTitle}>Admin TPQ</Text>
              <Text style={styles.roleCardDesc}>
                Kelola data santri dan pembayaran bisyaroh
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, styles.waliCard]}
            onPress={handleWaliPress}
            activeOpacity={0.8}
          >
            <View style={styles.roleIcon}>
              <Text style={styles.roleIconText}>👨‍👩‍👧‍👦</Text>
            </View>
            <View style={styles.roleContent}>
              <Text style={styles.roleCardTitle}>Wali Santri</Text>
              <Text style={styles.roleCardDesc}>
                Pantau dan bayar bisyaroh anak Anda
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>TPQ Ibadurrohman</Text>
          <Text style={styles.footerSubtext}>Malang, Jawa Timur</Text>
        </View>
      </View>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F50057",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
  },
  roleSection: {
    flex: 1,
    justifyContent: "center",
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 32,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
  },
  adminCard: {
    borderColor: "#3b82f6",
  },
  waliCard: {
    borderColor: "#10b981",
  },
  roleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  roleIconText: {
    fontSize: 24,
  },
  roleContent: {
    flex: 1,
  },
  roleCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  roleCardDesc: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: 12,
  },
  arrow: {
    fontSize: 20,
    color: "#94a3b8",
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
