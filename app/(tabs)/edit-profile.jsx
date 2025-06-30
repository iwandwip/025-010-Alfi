import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { updateUserProfile } from "../../services/userService";
import { getThemeByRole } from "../../constants/Colors";

export default function EditProfile() {
  const { userProfile, refreshProfile, isAdmin } = useAuth();
  const { theme, loading: settingsLoading } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = getThemeByRole(isAdmin);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    namaWarga: userProfile?.namaWarga || "",
    noHpWarga: userProfile?.noHpWarga || "",
    alamat: userProfile?.alamat || "",
  });
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.namaWarga.trim()) {
      newErrors.namaWarga = "Nama warga wajib diisi";
    }

    if (!formData.noHpWarga.trim()) {
      newErrors.noHpWarga = "No HP warga wajib diisi";
    }

    if (!formData.alamat.trim()) {
      newErrors.alamat = "Alamat warga wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await updateUserProfile(userProfile.id, formData);

      if (result.success) {
        await refreshProfile();
        Alert.alert(
          "Profil Berhasil Diperbarui",
          "Perubahan profil telah disimpan!",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert("Gagal Memperbarui", result.error);
      }
    } catch (error) {
      Alert.alert("Gagal Memperbarui", "Terjadi kesalahan. Silakan coba lagi.");
    }

    setLoading(false);
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profil</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
        >
          <View style={styles.content}>
            <View style={styles.titleSection}>
              <Text style={styles.subtitle}>
                Edit informasi profil warga
              </Text>
            </View>

            <View style={styles.formSection}>
              <Input
                label="Nama Warga"
                placeholder="Masukkan nama lengkap warga"
                value={formData.namaWarga}
                onChangeText={(value) => updateFormData("namaWarga", value)}
                autoCapitalize="words"
                error={errors.namaWarga}
              />

              <Input
                label="No HP Warga"
                placeholder="Masukkan nomor HP warga"
                value={formData.noHpWarga}
                onChangeText={(value) => updateFormData("noHpWarga", value)}
                keyboardType="phone-pad"
                error={errors.noHpWarga}
              />

              <Input
                label="Alamat"
                placeholder="Masukkan alamat lengkap"
                value={formData.alamat}
                onChangeText={(value) => updateFormData("alamat", value)}
                multiline
                numberOfLines={3}
                error={errors.alamat}
              />

              <Text style={styles.infoText}>
                ℹ️ RFID warga hanya dapat diatur oleh bendahara
              </Text>
            </View>

            <View style={styles.buttonSection}>
              <Button
                title="Batal"
                variant="outline"
                onPress={() => router.back()}
                style={styles.cancelButton}
                disabled={loading}
              />

              <Button
                title={loading ? "Menyimpan..." : "Simpan Perubahan"}
                onPress={handleSave}
                disabled={loading}
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
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    color: "#10b981",
    fontWeight: "500",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    flex: 1,
    textAlign: "center",
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
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 32,
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
  infoText: {
    fontSize: 14,
    color: "#059669",
    textAlign: "center",
    backgroundColor: "#dcfce7",
    padding: 12,
    borderRadius: 8,
    lineHeight: 20,
    marginTop: 16,
  },
  buttonSection: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
