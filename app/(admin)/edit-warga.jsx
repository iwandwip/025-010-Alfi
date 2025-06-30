import React, { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { getUserProfile, updateUserProfile } from "../../services/userService";

export default function EditWarga() {
  const { wargaId } = useLocalSearchParams();
  const [formData, setFormData] = useState({
    namaWarga: "",
    alamat: "",
    noHpWarga: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadSantriData = async () => {
    setLoading(true);
    const result = await getUserProfile(wargaId);
    if (result.success) {
      const warga = result.profile;
      setFormData({
        namaWarga: warga.namaWarga || "",
        alamat: warga.alamat || "",
        noHpWarga: warga.noHpWarga || "",
        email: warga.email || "",
      });
    } else {
      Alert.alert("Error", "Gagal memuat data warga");
      router.back();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSantriData();
  }, [wargaId]);

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.namaWarga.trim()) {
      Alert.alert("Error", "Nama warga wajib diisi");
      return false;
    }
    if (!formData.alamat.trim()) {
      Alert.alert("Error", "Nama wali wajib diisi");
      return false;
    }
    if (!formData.noHpWarga.trim()) {
      Alert.alert("Error", "No HP wali wajib diisi");
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert("Error", "Email wali wajib diisi");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Error", "Format email tidak valid");
      return false;
    }
    return true;
  };

  const handleSimpan = async () => {
    if (!validateForm()) return;

    Alert.alert(
      "Konfirmasi Perubahan",
      "Apakah Anda yakin ingin menyimpan perubahan data warga?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Simpan",
          onPress: async () => {
            setSaving(true);
            const updateData = {
              namaWarga: formData.namaWarga,
              alamat: formData.alamat,
              noHpWarga: formData.noHpWarga,
              email: formData.email,
            };

            const result = await updateUserProfile(wargaId, updateData);

            if (result.success) {
              Alert.alert("Berhasil", "Data warga berhasil diperbarui!", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } else {
              Alert.alert("Gagal", result.error);
            }
            setSaving(false);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Batal</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Data Santri</Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner text="Memuat data warga..." />
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.backButtonText}>← Batal</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Data Santri</Text>
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
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Perubahan data akan mempengaruhi akun login wali warga
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Santri</Text>

              <Input
                label="Nama Santri"
                placeholder="Masukkan nama lengkap warga"
                value={formData.namaWarga}
                onChangeText={(value) => updateForm("namaWarga", value)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Wali Santri</Text>

              <Input
                label="Nama Wali"
                placeholder="Masukkan nama lengkap wali"
                value={formData.alamat}
                onChangeText={(value) => updateForm("alamat", value)}
                autoCapitalize="words"
              />

              <Input
                label="No HP Wali"
                placeholder="Masukkan nomor HP wali"
                value={formData.noHpWarga}
                onChangeText={(value) => updateForm("noHpWarga", value)}
                keyboardType="phone-pad"
              />

              <Input
                label="Email Wali"
                placeholder="Masukkan email untuk login wali"
                value={formData.email}
                onChangeText={(value) => updateForm("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  ℹ️ Jika email diubah, wali warga perlu menggunakan email baru
                  untuk login
                </Text>
              </View>
            </View>

            <View style={styles.buttonSection}>
              <Button
                title="Batal"
                onPress={() => router.back()}
                variant="outline"
                style={styles.cancelButton}
                disabled={saving}
              />

              <Button
                title={saving ? "Menyimpan..." : "Simpan Perubahan"}
                onPress={handleSimpan}
                disabled={saving}
                style={styles.saveButton}
              />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  warningBox: {
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  warningText: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
    textAlign: "center",
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
  buttonSection: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    borderColor: "#64748b",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#10b981",
  },
});
