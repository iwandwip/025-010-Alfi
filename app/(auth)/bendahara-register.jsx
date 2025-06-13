import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SafeArea,
  VStack,
  HStack,
  CustomText as Text,
  Heading,
  Box,
  Center,
  Button,
  Input,
  Colors,
} from "../../components/ui/CoreComponents";
import { signUpWithEmail } from "../../services/authService";

export default function BendaharaRegister() {
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
      role: "bendahara",
    };

    const result = await signUpWithEmail(
      formData.email,
      formData.password,
      profileData
    );

    if (result.success) {
      Alert.alert("Berhasil", "Akun bendahara berhasil dibuat!", [
        { text: "OK", onPress: () => router.replace("/(admin)") },
      ]);
    } else {
      Alert.alert("Pendaftaran Gagal", result.error);
    }
    setLoading(false);
  };

  return (
    <SafeArea style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <VStack style={styles.content}>
            {/* Header */}
            <HStack style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <HStack style={styles.backButton}>
                  <Text style={styles.backIcon}>←</Text>
                  <Text style={styles.backText}>Kembali</Text>
                </HStack>
              </TouchableOpacity>
            </HStack>

            {/* Content */}
            <VStack style={styles.mainContent}>
              {/* Logo/Illustration Area */}
              <Center style={styles.logoSection}>
                <Box style={styles.logoContainer}>
                  <Text style={styles.logoIcon}>👤➕</Text>
                </Box>
              </Center>

              {/* Title Section */}
              <VStack style={styles.titleSection}>
                <Heading size="lg" style={styles.title}>
                  Daftar Bendahara
                </Heading>
                <Text style={styles.subtitle}>
                  Buat akun bendahara untuk mengelola jimpitan warga
                </Text>
              </VStack>

              {/* Form Section */}
              <VStack style={styles.formSection}>
                <VStack style={styles.formGroup}>
                  <HStack style={styles.formHeader}>
                    <Text style={styles.sectionIcon}>📧</Text>
                    <Heading size="sm" style={styles.sectionTitle}>
                      Informasi Akun
                    </Heading>
                  </HStack>

                  <Input
                    label="Email"
                    placeholder="Masukkan email bendahara"
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
                    placeholder="Masukkan ulang password"
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateForm("confirmPassword", value)}
                    secureTextEntry
                  />
                </VStack>

                <View style={styles.divider} />

                <VStack style={styles.formGroup}>
                  <HStack style={styles.formHeader}>
                    <Text style={styles.sectionIcon}>👤</Text>
                    <Heading size="sm" style={styles.sectionTitle}>
                      Informasi Pribadi
                    </Heading>
                  </HStack>

                  <Input
                    label="Nama Lengkap"
                    placeholder="Masukkan nama lengkap"
                    value={formData.nama}
                    onChangeText={(value) => updateForm("nama", value)}
                  />

                  <Input
                    label="No. HP"
                    placeholder="Masukkan nomor HP"
                    value={formData.noHp}
                    onChangeText={(value) => updateForm("noHp", value)}
                    keyboardType="phone-pad"
                  />
                </VStack>

                <Button
                  title={loading ? "Sedang Daftar..." : "Daftar Akun"}
                  onPress={handleRegister}
                  disabled={loading}
                  loading={loading}
                  variant="primary"
                  size="lg"
                  style={[styles.registerButton, { backgroundColor: Colors.green }]}
                />
              </VStack>

              {/* Login Link */}
              <Center style={styles.loginSection}>
                <VStack style={styles.loginContent}>
                  <Text style={styles.loginQuestion}>
                    Sudah memiliki akun?
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/(auth)/bendahara-login")}>
                    <Text style={styles.loginLink}>
                      Masuk Sekarang
                    </Text>
                  </TouchableOpacity>
                </VStack>
              </Center>
            </VStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.green + '10',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  
  // Header
  header: {
    paddingVertical: 16,
  },
  backButton: {
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: Colors.green,
    marginRight: 4,
  },
  backText: {
    color: Colors.green,
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Main Content
  mainContent: {
    flex: 1,
  },
  
  // Logo
  logoSection: {
    marginBottom: 24,
  },
  logoContainer: {
    backgroundColor: Colors.white,
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: Colors.green + '30',
  },
  logoIcon: {
    fontSize: 32,
  },
  
  // Title
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: Colors.gray800,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  
  // Form
  formSection: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    color: Colors.gray700,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginVertical: 16,
  },
  registerButton: {
    marginTop: 16,
  },
  
  // Login
  loginSection: {
    marginBottom: 16,
  },
  loginContent: {
    alignItems: 'center',
  },
  loginQuestion: {
    fontSize: 14,
    color: Colors.gray600,
    marginBottom: 8,
  },
  loginLink: {
    color: Colors.green,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});