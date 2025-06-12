import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { updateUserProfile } from "../../services/userService";
import { getColors } from "../../constants/Colors";

export default function EditProfile() {
  const { userProfile, refreshProfile } = useAuth();
  const { theme, loading: settingsLoading } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = getColors(theme);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    namaWali: userProfile?.namaWali || "",
    noHpWali: userProfile?.noHpWali || "",
    namaSantri: userProfile?.namaSantri || "",
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

    if (!formData.namaWali.trim()) {
      newErrors.namaWali = "Nama wali wajib diisi";
    }

    if (!formData.noHpWali.trim()) {
      newErrors.noHpWali = "No HP wali wajib diisi";
    }

    if (!formData.namaSantri.trim()) {
      newErrors.namaSantri = "Nama santri wajib diisi";
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
          { paddingTop: insets.top, backgroundColor: colors.background },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.white,
              borderBottomColor: colors.gray200,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              ← Kembali
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.gray900 }]}>
            Edit Profil
          </Text>
        </View>
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
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.white,
              borderBottomColor: colors.gray200,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              ← Kembali
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.gray900 }]}>
            Edit Profil
          </Text>
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
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.gray900, borderBottomColor: colors.primary },
                ]}
              >
                Informasi Wali Santri
              </Text>

              <Input
                label="Nama Wali"
                placeholder="Masukkan nama lengkap wali"
                value={formData.namaWali}
                onChangeText={(value) => updateFormData("namaWali", value)}
                autoCapitalize="words"
                error={errors.namaWali}
              />

              <Input
                label="No HP Wali"
                placeholder="Masukkan nomor HP wali"
                value={formData.noHpWali}
                onChangeText={(value) => updateFormData("noHpWali", value)}
                keyboardType="phone-pad"
                error={errors.noHpWali}
              />
            </View>

            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.gray900, borderBottomColor: colors.primary },
                ]}
              >
                Informasi Santri
              </Text>

              <Input
                label="Nama Santri"
                placeholder="Masukkan nama lengkap santri"
                value={formData.namaSantri}
                onChangeText={(value) => updateFormData("namaSantri", value)}
                autoCapitalize="words"
                error={errors.namaSantri}
              />

              <View
                style={[
                  styles.infoBox,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Text style={[styles.infoText, { color: colors.primary }]}>
                  ℹ️ RFID santri hanya dapat diatur oleh admin TPQ
                </Text>
              </View>
            </View>

            <View style={styles.buttonSection}>
              <Button
                title="Batal"
                onPress={() => router.back()}
                variant="outline"
                style={[styles.cancelButton, { borderColor: colors.gray400 }]}
                disabled={loading}
              />

              <Button
                title={loading ? "Menyimpan..." : "Simpan Perubahan"}
                onPress={handleSave}
                disabled={loading}
                style={[styles.saveButton, { backgroundColor: colors.success }]}
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
  keyboardContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
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
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
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
  },
  saveButton: {
    flex: 1,
  },
});
