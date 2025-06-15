import React, { useState } from "react";
import {
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Surface,
  Text,
  Card,
  Avatar,
  IconButton,
  ActivityIndicator,
  useTheme,
  TextInput,
  Button,
  Divider
} from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import { updateUserProfile } from "../../services/userService";
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';

export default function EditProfile() {
  const { userProfile, refreshProfile } = useAuth();
  const { theme, loading: settingsLoading } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paperTheme = useTheme();

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
        colors={[paperTheme.colors.primaryContainer, paperTheme.colors.background]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <Surface style={styles.header} elevation={2}>
          <IconButton
            icon="arrow-left"
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Edit Profil
          </Text>
          <View style={styles.placeholder} />
        </Surface>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" animating />
          <Text variant="bodyLarge" style={{ marginTop: 16 }}>
            Memuat profil...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[paperTheme.colors.primaryContainer, paperTheme.colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <Surface style={styles.header} elevation={2}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Edit Profil
        </Text>
        <View style={styles.placeholder} />
      </Surface>

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
              <Card style={styles.profileCard} mode="elevated">
                <Card.Content>
                  <View style={styles.profileHeader}>
                    <Avatar.Text 
                      size={64} 
                      label={userProfile?.namaWarga?.charAt(0)?.toUpperCase() || 'W'}
                      style={{ backgroundColor: paperTheme.colors.primary }}
                      color={paperTheme.colors.onPrimary}
                    />
                    <View style={styles.profileInfo}>
                      <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                        {userProfile?.namaWarga || 'Nama Warga'}
                      </Text>
                      <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                        {userProfile?.email}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>

            {/* Personal Information Form */}
            <Animated.View entering={SlideInUp.delay(200)}>
              <Card style={styles.formCard} mode="outlined">
                <Card.Content>
                  <View style={styles.section}>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: paperTheme.colors.primary }]}>Informasi Pribadi</Text>
                    <Divider style={{ marginBottom: 16 }} />

                    <TextInput
                      label="Nama Warga"
                      placeholder="Masukkan nama lengkap warga"
                      value={formData.namaWarga}
                      onChangeText={(value) => updateFormData("namaWarga", value)}
                      autoCapitalize="words"
                      error={!!errors.namaWarga}
                      mode="outlined"
                      style={styles.textInput}
                    />
                    {errors.namaWarga && (
                      <Text variant="bodySmall" style={{ color: paperTheme.colors.error, marginTop: 4 }}>
                        {errors.namaWarga}
                      </Text>
                    )}

                    <TextInput
                      label="No HP Warga"
                      placeholder="Masukkan nomor HP warga"
                      value={formData.noHpWarga}
                      onChangeText={(value) => updateFormData("noHpWarga", value)}
                      keyboardType="phone-pad"
                      error={!!errors.noHpWarga}
                      mode="outlined"
                      style={styles.textInput}
                    />
                    {errors.noHpWarga && (
                      <Text variant="bodySmall" style={{ color: paperTheme.colors.error, marginTop: 4 }}>
                        {errors.noHpWarga}
                      </Text>
                    )}
                  </View>

                  <Divider style={{ marginVertical: 16 }} />

                  <View style={styles.section}>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: paperTheme.colors.primary }]}>Informasi Alamat</Text>
                    <Divider style={{ marginBottom: 16 }} />

                    <TextInput
                      label="Alamat"
                      placeholder="Masukkan alamat lengkap"
                      value={formData.alamat}
                      onChangeText={(value) => updateFormData("alamat", value)}
                      multiline
                      numberOfLines={3}
                      error={!!errors.alamat}
                      mode="outlined"
                      style={styles.textInput}
                    />
                    {errors.alamat && (
                      <Text variant="bodySmall" style={{ color: paperTheme.colors.error, marginTop: 4 }}>
                        {errors.alamat}
                      </Text>
                    )}

                    <Card style={[styles.infoCard, { backgroundColor: paperTheme.colors.primaryContainer }]} mode="contained">
                      <Card.Content style={{ paddingVertical: 12 }}>
                        <Text variant="bodySmall" style={{ color: paperTheme.colors.onPrimaryContainer, lineHeight: 18 }}>
                          ℹ️ RFID warga hanya dapat diatur oleh bendahara
                        </Text>
                      </Card.Content>
                    </Card>
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>

            <Animated.View entering={SlideInUp.delay(400)} style={styles.buttonSection}>
              <Button
                mode="outlined"
                onPress={() => router.back()}
                style={styles.cancelButton}
                disabled={loading}
              >
                Batal
              </Button>

              <Button
                mode="contained"
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
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
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
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileInfo: {
    flex: 1,
  },
  formCard: {
    borderRadius: 16,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 8,
    marginTop: 8,
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
