import React, { useState } from "react";
import {
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import { updateUserProfile } from "../../services/userService";
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function EditProfile() {
  const { userProfile, refreshProfile } = useAuth();
  const { theme, loading: settingsLoading } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Using custom theme from constants

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

  if (settingsLoading || !userProfile) {
    return (
      <LinearGradient
        colors={[Colors.primary + '20', Colors.background]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={[styles.header, Shadows.md]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Edit Profil
          </Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            Memuat profil...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.primary + '20', Colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={[styles.header, Shadows.md]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Edit Profil
        </Text>
        <View style={styles.placeholder} />
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
            {/* Profile Header Card */}
            <Animated.View entering={FadeInDown.delay(100)}>
              <View style={[styles.profileCard, Shadows.lg]}>
                <View style={styles.profileHeader}>
                  <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
                    <Text style={[styles.avatarText, { color: Colors.textInverse }]}>
                      {userProfile?.namaWarga?.charAt(0)?.toUpperCase() || 'W'}
                    </Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>
                      {userProfile?.namaWarga || 'Nama Warga'}
                    </Text>
                    <Text style={[styles.profileEmail, { color: Colors.textSecondary }]}>
                      {userProfile?.email}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Personal Information Form */}
            <Animated.View entering={SlideInUp.delay(200)}>
              <View style={[styles.formCard, Shadows.md]}>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: Colors.primary }]}>Informasi Pribadi</Text>
                  <View style={styles.divider} />

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
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: Colors.primary }]}>Informasi Alamat</Text>
                  <View style={styles.divider} />

                  <Input
                    label="Alamat"
                    placeholder="Masukkan alamat lengkap"
                    value={formData.alamat}
                    onChangeText={(value) => updateFormData("alamat", value)}
                    multiline
                    numberOfLines={3}
                    error={errors.alamat}
                  />

                  <View style={[styles.infoCard, { backgroundColor: Colors.primary + '20' }]}>
                    <Text style={[styles.infoText, { color: Colors.primary }]}>
                      ℹ️ RFID warga hanya dapat diatur oleh bendahara
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={SlideInUp.delay(400)} style={styles.buttonSection}>
              <Button
                variant="outline"
                onPress={() => router.back()}
                style={styles.cancelButton}
                disabled={loading}
              >
                Batal
              </Button>

              <Button
                variant="primary"
                onPress={handleSave}
                disabled={loading}
                loading={loading}
                style={styles.saveButton}
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    color: Colors.text,
  },
  placeholder: {
    width: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 16,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingVertical: 24,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileInfo: {
    flex: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  profileEmail: {
    fontSize: 14,
  },
  formCard: {
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    padding: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  infoCard: {
    borderRadius: 8,
    marginTop: 8,
    padding: 12,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  buttonSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
