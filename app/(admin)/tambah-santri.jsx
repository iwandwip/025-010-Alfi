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

export default function TambahSantri() {
  const [formData, setFormData] = useState({
    emailWali: "",
    passwordWali: "",
    namaSantri: "",
    namaWali: "",
    noHpWali: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.emailWali.trim()) {
      Alert.alert("Error", "Email wali wajib diisi");
      return false;
    }
    if (!formData.passwordWali.trim()) {
      Alert.alert("Error", "Password wali wajib diisi");
      return false;
    }
    if (formData.passwordWali.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter");
      return false;
    }
    if (!formData.namaSantri.trim()) {
      Alert.alert("Error", "Nama santri wajib diisi");
      return false;
    }
    if (!formData.namaWali.trim()) {
      Alert.alert("Error", "Nama wali wajib diisi");
      return false;
    }
    if (!formData.noHpWali.trim()) {
      Alert.alert("Error", "No HP wali wajib diisi");
      return false;
    }
    return true;
  };

  const handleSimpan = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const profileData = {
      namaSantri: formData.namaSantri,
      namaWali: formData.namaWali,
      noHpWali: formData.noHpWali,
      rfidSantri: "",
      role: "user",
    };

    const result = await signUpWithEmail(
      formData.emailWali,
      formData.passwordWali,
      profileData
    );

    if (result.success) {
      Alert.alert(
        "Berhasil",
        "Data santri dan akun wali berhasil ditambahkan!",
        [
          {
            text: "OK",
            onPress: () => {
              setFormData({
                emailWali: "",
                passwordWali: "",
                namaSantri: "",
                namaWali: "",
                noHpWali: "",
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
          <Text style={styles.headerTitle}>Tambah Data Santri</Text>
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
              <Text style={styles.sectionTitle}>Data Santri</Text>

              <Input
                label="Nama Santri"
                placeholder="Masukkan nama lengkap santri"
                value={formData.namaSantri}
                onChangeText={(value) => updateForm("namaSantri", value)}
                autoCapitalize="words"
              />

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  ℹ️ RFID santri akan diatur setelah data tersimpan melalui menu
                  Daftar Santri
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Wali Santri</Text>

              <Input
                label="Nama Wali"
                placeholder="Masukkan nama lengkap wali"
                value={formData.namaWali}
                onChangeText={(value) => updateForm("namaWali", value)}
                autoCapitalize="words"
              />

              <Input
                label="No HP Wali"
                placeholder="Masukkan nomor HP wali"
                value={formData.noHpWali}
                onChangeText={(value) => updateForm("noHpWali", value)}
                keyboardType="phone-pad"
              />

              <Input
                label="Email Wali"
                placeholder="Masukkan email untuk login wali"
                value={formData.emailWali}
                onChangeText={(value) => updateForm("emailWali", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Password Wali"
                placeholder="Buat password untuk wali (min. 6 karakter)"
                value={formData.passwordWali}
                onChangeText={(value) => updateForm("passwordWali", value)}
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
