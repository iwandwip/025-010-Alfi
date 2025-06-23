import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { signUpWithEmail } from "../../services/authService";
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';

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
  // Using custom theme from constants

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
      colors={[Colors.primaryContainer, Colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={[styles.header, Shadows.md]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Tambah Data Warga
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
            {/* Header Card */}
            <View style={[styles.headerCard, Shadows.md]}>
              <View style={styles.headerCardContent}>
                <View style={[styles.headerIcon, { backgroundColor: Colors.primary }]}>
                  <MaterialIcons name="person-add" size={32} color={Colors.onPrimary} />
                </View>
                <View style={styles.headerCardInfo}>
                  <Text style={[styles.headerCardTitle, { fontWeight: 'bold' }]}>
                    Form Data Warga
                  </Text>
                  <Text style={[styles.headerCardSubtitle, { color: Colors.onSurfaceVariant }]}>
                    Tambah warga baru ke sistem
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.formCard, { borderWidth: 1, borderColor: Colors.outline }]}>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: Colors.primary }]}>Data Warga</Text>
                <View style={[styles.divider, { backgroundColor: Colors.outline }]} />

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

                <View style={[styles.infoCard, { backgroundColor: Colors.primaryContainer }]}>
                  <Text style={[styles.infoText, { color: Colors.onPrimaryContainer }]}>
                    ℹ️ RFID warga akan diatur setelah data tersimpan melalui menu Daftar Warga
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: Colors.outline, marginVertical: 16 }]} />

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: Colors.primary }]}>Data Akun Warga</Text>
                <View style={[styles.divider, { backgroundColor: Colors.outline }]} />

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
                  placeholder="Buat password warga"
                  value={formData.passwordWarga}
                  onChangeText={(value) => updateForm("passwordWarga", value)}
                  secureTextEntry
                />
              </View>
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
    backgroundColor: Colors.surface,
    padding: 20,
  },
  headerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerCardInfo: {
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerCardSubtitle: {
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
    marginBottom: 16,
  },
  infoCard: {
    borderRadius: 12,
    marginTop: 8,
    padding: 12,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  simpanButton: {
    marginTop: 8,
    marginBottom: 16,
  },
});
