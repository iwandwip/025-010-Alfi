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
import { getThemeByRole } from "../../constants/Colors";

export default function WargaLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = getThemeByRole(false); // Warga theme

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
          <View style={styles.titleSection}>
            <Text style={styles.title}>Masuk Warga</Text>
            <Text style={styles.subtitle}>
              Masuk untuk memantau dan membayar jimpitan
            </Text>
            <Text style={styles.infoText}>
              Belum punya akun? Hubungi bendahara untuk pendaftaran
            </Text>
          </View>

          <View style={styles.formSection}>
            <Input
              label="Email"
              placeholder="Masukkan email Anda"
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
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
    color: "#10b981",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#059669",
    textAlign: "center",
    backgroundColor: "#dcfce7",
    padding: 12,
    borderRadius: 8,
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 32,
  },
  loginButton: {
    marginTop: 8,
    backgroundColor: "#10b981",
  },
});