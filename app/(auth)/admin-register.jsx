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
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { signUpWithEmail } from "../../services/authService";

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nama: "",
    noHp: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert("Error", "Email wajib diisi");
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert("Error", "Password wajib diisi");
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Konfirmasi password tidak cocok");
      return false;
    }
    if (!formData.nama.trim()) {
      Alert.alert("Error", "Nama wajib diisi");
      return false;
    }
    if (!formData.noHp.trim()) {
      Alert.alert("Error", "No HP wajib diisi");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const profileData = {
      nama: formData.nama,
      noHp: formData.noHp,
      role: "admin",
    };

    const result = await signUpWithEmail(
      formData.email,
      formData.password,
      profileData
    );

    if (result.success) {
      Alert.alert("Berhasil", "Akun admin berhasil dibuat!", [
        { text: "OK", onPress: () => router.replace("/(admin)") },
      ]);
    } else {
      Alert.alert("Pendaftaran Gagal", result.error);
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

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>Daftar Admin</Text>
              <Text style={styles.subtitle}>
                Buat akun Administrator TPQ Ibadurrohman
              </Text>
            </View>

            <View style={styles.formSection}>
              <Input
                label="Email"
                placeholder="Masukkan email admin"
                value={formData.email}
                onChangeText={(value) => updateForm("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Password"
                placeholder="Masukkan password (min. 6 karakter)"
                value={formData.password}
                onChangeText={(value) => updateForm("password", value)}
                secureTextEntry
              />

              <Input
                label="Konfirmasi Password"
                placeholder="Ulangi password"
                value={formData.confirmPassword}
                onChangeText={(value) => updateForm("confirmPassword", value)}
                secureTextEntry
              />

              <Input
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                value={formData.nama}
                onChangeText={(value) => updateForm("nama", value)}
                autoCapitalize="words"
              />

              <Input
                label="No HP"
                placeholder="Masukkan nomor HP"
                value={formData.noHp}
                onChangeText={(value) => updateForm("noHp", value)}
                keyboardType="phone-pad"
              />

              <Button
                title={loading ? "Sedang Mendaftar..." : "Daftar"}
                onPress={handleRegister}
                disabled={loading}
                style={styles.registerButton}
              />
            </View>

            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Sudah memiliki akun admin?</Text>
              <Link href="/(auth)/admin-login" style={styles.loginLink}>
                Masuk Sekarang
              </Link>
            </View>
          </View>
        </ScrollView>
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
    color: "#3b82f6",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
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
  },
  formSection: {
    marginBottom: 32,
  },
  registerButton: {
    marginTop: 8,
  },
  loginSection: {
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  loginLink: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
});
