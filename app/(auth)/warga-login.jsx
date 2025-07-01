import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { signInWithEmail } from "../../services/authService";
import { lightTheme } from "../../constants/Colors";

export default function WargaLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Mohon isi email dan password");
      return;
    }

    setLoading(true);
    const result = await signInWithEmail(email, password);

    if (result.success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Masuk Gagal", result.error);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logo}>
              <Text style={styles.logoIcon}>👨‍👩‍👧‍👦</Text>
            </View>
            <Text style={styles.logoTitle}>Portal Warga</Text>
            <Text style={styles.logoSubtitle}>Masuk ke sistem jimpitan</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Input
              label="Email"
              placeholder="warga@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="Masukkan password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title={loading ? "Sedang Masuk..." : "Masuk"}
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginButton}
            />
          </View>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpText}>Belum memiliki akun?</Text>
            <Text style={styles.helpLink}>
              Hubungi Bendahara untuk Pendaftaran
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    color: lightTheme.secondary,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 60,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: lightTheme.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: lightTheme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 32,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: lightTheme.primary,
    marginBottom: 8,
  },
  logoSubtitle: {
    fontSize: 16,
    color: lightTheme.gray500,
    fontWeight: "400",
  },
  formContainer: {
    gap: 20,
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: lightTheme.primary,
    marginTop: 8,
  },
  helpSection: {
    alignItems: "center",
  },
  helpText: {
    fontSize: 14,
    color: lightTheme.gray500,
    marginBottom: 8,
  },
  helpLink: {
    fontSize: 14,
    color: lightTheme.primary,
    fontWeight: "600",
  },
});
