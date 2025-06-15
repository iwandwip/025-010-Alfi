import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  Surface,
  Text,
  Card,
  Avatar,
  IconButton,
  ActivityIndicator,
  useTheme,
  Divider
} from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { signUpWithEmail } from "../../services/authService";
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';

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
  const paperTheme = useTheme();

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
          Tambah Data Warga
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
            {/* Header Card */}
            <Animated.View entering={FadeInDown.delay(100)}>
              <Card style={styles.headerCard} mode="elevated">
                <Card.Content>
                  <View style={styles.headerCardContent}>
                    <Avatar.Icon 
                      size={48} 
                      icon="account-plus" 
                      style={{ backgroundColor: paperTheme.colors.primary }}
                      color={paperTheme.colors.onPrimary}
                    />
                    <View style={styles.headerCardInfo}>
                      <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                        Form Data Warga
                      </Text>
                      <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                        Tambah warga baru ke sistem
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>

            <Animated.View entering={SlideInUp.delay(200)}>
              <Card style={styles.formCard} mode="outlined">
                <Card.Content>
                  <View style={styles.section}>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: paperTheme.colors.primary }]}>Data Warga</Text>
                    <Divider style={{ marginBottom: 16 }} />

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

                    <Card style={[styles.infoCard, { backgroundColor: paperTheme.colors.primaryContainer }]} mode="contained">
                      <Card.Content style={{ paddingVertical: 12 }}>
                        <Text variant="bodySmall" style={{ color: paperTheme.colors.onPrimaryContainer, lineHeight: 18 }}>
                          ℹ️ RFID warga akan diatur setelah data tersimpan melalui menu Daftar Warga
                        </Text>
                      </Card.Content>
                    </Card>
                  </View>

                  <Divider style={{ marginVertical: 16 }} />

                  <View style={styles.section}>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: paperTheme.colors.primary }]}>Data Akun Warga</Text>
                    <Divider style={{ marginBottom: 16 }} />

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
                </Card.Content>
              </Card>
            </Animated.View>

            <Animated.View entering={SlideInUp.delay(400)}>
              <Button
                title={loading ? "Sedang Menyimpan..." : "Simpan Data"}
                onPress={handleSimpan}
                disabled={loading}
                style={styles.simpanButton}
              />
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
  headerCard: {
    borderRadius: 16,
    marginBottom: 16,
  },
  headerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerCardInfo: {
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
  infoCard: {
    borderRadius: 12,
    marginTop: 8,
  },
  simpanButton: {
    marginTop: 8,
    marginBottom: 16,
  },
});
