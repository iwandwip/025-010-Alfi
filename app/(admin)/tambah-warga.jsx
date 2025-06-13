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
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { signUpWithEmail } from "../../services/authService";

export default function TambahWarga() {
  const [formData, setFormData] = useState({
    emailWarga: "",
    passwordWarga: "",
    namaWarga: "",
    alamat: "",
    noHpWarga: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.emailWarga.trim()) {
      Alert.alert("Error", "Email warga wajib diisi");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailWarga.trim())) {
      Alert.alert("Error", "Format email tidak valid");
      return false;
    }
    
    if (!formData.passwordWarga.trim()) {
      Alert.alert("Error", "Password warga wajib diisi");
      return false;
    }
    if (formData.passwordWarga.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter");
      return false;
    }
    if (!formData.namaWarga.trim()) {
      Alert.alert("Error", "Nama warga wajib diisi");
      return false;
    }
    if (!formData.alamat.trim()) {
      Alert.alert("Error", "Alamat warga wajib diisi");
      return false;
    }
    if (!formData.noHpWarga.trim()) {
      Alert.alert("Error", "No HP warga wajib diisi");
      return false;
    }
    return true;
  };

  const handleSimpan = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const profileData = {
      namaWarga: formData.namaWarga,
      alamat: formData.alamat,
      noHpWarga: formData.noHpWarga,
      rfidWarga: "",
      role: "user",
    };

    const result = await signUpWithEmail(
      formData.emailWarga,
      formData.passwordWarga,
      profileData
    );

    if (result.success) {
      Alert.alert(
        "Berhasil",
        "Data warga berhasil ditambahkan!",
        [
          {
            text: "OK",
            onPress: () => {
              setFormData({
                emailWarga: "",
                passwordWarga: "",
                namaWarga: "",
                alamat: "",
                noHpWarga: "",
              });
              router.back();
            },
          },
        ]
      );
    } else {
      Alert.alert("Gagal", result.error);
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
          <Text style={styles.headerTitle}>Tambah Data Warga</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
        >
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Warga</Text>

              <Input
                label="Nama Warga"
                placeholder="Masukkan nama lengkap warga"
                value={formData.namaWarga}
                onChangeText={(value) => updateForm("namaWarga", value)}
                autoCapitalize="words"
              />

              <Input
                label="Alamat"
                placeholder="Masukkan alamat lengkap"
                value={formData.alamat}
                onChangeText={(value) => updateForm("alamat", value)}
                autoCapitalize="words"
              />

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  ℹ️ RFID warga akan diatur setelah data tersimpan melalui menu
                  Daftar Warga
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Akun Warga</Text>

              <Input
                label="No HP Warga"
                placeholder="Masukkan nomor HP warga"
                value={formData.noHpWarga}
                onChangeText={(value) => updateForm("noHpWarga", value)}
                keyboardType="phone-pad"
              />

              <Input
                label="Email Warga"
                placeholder="Masukkan email untuk login warga"
                value={formData.emailWarga}
                onChangeText={(value) => updateForm("emailWarga", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Password Warga"
                placeholder="Buat password untuk warga (min. 6 karakter)"
                value={formData.passwordWarga}
                onChangeText={(value) => updateForm("passwordWarga", value)}
                secureTextEntry
              />
            </View>

            <Button
              title={loading ? "Sedang Menyimpan..." : "Simpan Data"}
              onPress={handleSimpan}
              disabled={loading}
              style={styles.simpanButton}
            />
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
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
  },
  infoBox: {
    backgroundColor: "#dbeafe",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 20,
  },
  simpanButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
