import React, { useState } from "react";
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Using custom theme from constants

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
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
    return true;
  };

  const validateStep2 = () => {
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

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;

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

  const progress = currentStep / 2;

  return (
    <LinearGradient
      colors={[Colors.primaryContainer, Colors.surface]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View>
            <TouchableOpacity
              onPress={() => {
                if (currentStep === 1) {
                  router.back();
                } else {
                  setCurrentStep(1);
                }
              }}
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={28} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <Text style={{ color: Colors.onView, marginBottom: 8 }}>
              Langkah {currentStep} dari 2
            </Text>
            <View style={[styles.progressBar, { backgroundColor: Colors.outline }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress * 100}%`, 
                    backgroundColor: Colors.primary 
                  }
                ]} 
              />
            </View>
          </View>

          {/* Logo Section */}
          <View 
            style={styles.logoSection}
          >
            <View style={[styles.logoContainer, { backgroundColor: Colors.primary }, Shadows.md]}>
              <MaterialIcons name="person-add" size={80} color={Colors.onPrimary} />
            </View>
            
            <Text style={[styles.title, { color: Colors.onView }]}>
              Daftar Bendahara
            </Text>
            
            <Text style={[styles.subtitle, { color: Colors.onViewVariant }]}>
              Buat akun untuk mengelola jimpitan warga
            </Text>
          </View>

          {/* Step 1: Account Info */}
          {currentStep === 1 && (
            <View>
              <View style={[styles.formCard, Shadows.md, { backgroundColor: Colors.surface }]}>
                <View style={{ padding: 20 }}>
                  <View style={styles.stepHeader}>
                    <View style={[styles.stepIcon, { backgroundColor: Colors.primaryContainer }]}>
                      <MaterialIcons name="email" size={24} color={Colors.onPrimaryContainer} />
                    </View>
                    <Text style={styles.stepTitle}>
                      Informasi Akun
                    </Text>
                  </View>

                  <Input
                    label="Email Bendahara"
                    value={formData.email}
                    onChangeText={(value) => updateForm("email", value)}
                                        keyboardType="email-address"
                    autoCapitalize="none"
                    left={<Input.Icon icon="email-outline" />}
                    style={styles.input}
                    outlineStyle={{ borderRadius: 16 }}
                  />

                  <Input
                    label="Password"
                    value={formData.password}
                    onChangeText={(value) => updateForm("password", value)}
                                        secureTextEntry={!showPassword}
                    left={<Input.Icon icon="lock-outline" />}
                    right={
                      <Input.Icon 
                        icon={showPassword ? "eye-off" : "eye"} 
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    style={styles.input}
                    outlineStyle={{ borderRadius: 16 }}
                    helperText="Minimal 6 karakter"
                  />

                  <Input
                    label="Konfirmasi Password"
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateForm("confirmPassword", value)}
                                        secureTextEntry={!showConfirmPassword}
                    left={<Input.Icon icon="lock-check-outline" />}
                    right={
                      <Input.Icon 
                        icon={showConfirmPassword ? "eye-off" : "eye"} 
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                    style={styles.input}
                    outlineStyle={{ borderRadius: 16 }}
                  />

                  <Button
                    variant="primary"
                    onPress={handleNext}
                    style={styles.nextButton}
                    contentStyle={styles.buttonContent}
                    icon="arrow-right"
                  >
                    Lanjutkan
                  </Button>
                </View>
              </View>
            </View>
          )}

          {/* Step 2: Personal Info */}
          {currentStep === 2 && (
            <View>
              <View style={[styles.formCard, Shadows.md, { backgroundColor: Colors.surface }]}>
                <View style={{ padding: 20 }}>
                  <View style={styles.stepHeader}>
                    <View style={[styles.stepIcon, { backgroundColor: Colors.secondaryContainer }]}>
                      <MaterialIcons name="person" size={24} color={Colors.onSecondaryContainer} />
                    </View>
                    <Text style={styles.stepTitle}>
                      Informasi Pribadi
                    </Text>
                  </View>

                  <Input
                    label="Nama Lengkap"
                    value={formData.nama}
                    onChangeText={(value) => updateForm("nama", value)}
                                        left={<Input.Icon icon="account-outline" />}
                    style={styles.input}
                    outlineStyle={{ borderRadius: 16 }}
                  />

                  <Input
                    label="Nomor HP"
                    value={formData.noHp}
                    onChangeText={(value) => updateForm("noHp", value)}
                                        keyboardType="phone-pad"
                    left={<Input.Icon icon="phone-outline" />}
                    style={styles.input}
                    outlineStyle={{ borderRadius: 16 }}
                  />

                  <Button
                    variant="primary"
                    onPress={handleRegister}
                    loading={loading}
                    disabled={loading}
                    style={styles.registerButton}
                    contentStyle={styles.buttonContent}
                    icon="account-plus"
                  >
                    {loading ? "Membuat Akun..." : "Daftar Sekarang"}
                  </Button>
                </View>
              </View>
            </View>
          )}

          {/* Login Link */}
          <View 
            style={styles.loginSection}
          >
            <Text style={{ color: Colors.onViewVariant }}>
              Sudah punya akun bendahara?
            </Text>
            <Button
              variant="outline"
              onPress={() => router.push("/(auth)/bendahara-login")}
              style={styles.loginButton}
              labelStyle={{ color: Colors.primary }}
            >
              Masuk Sekarang
            </Button>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -8,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 24,
    marginBottom: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  stepTitle: {
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
  },
  nextButton: {
    marginTop: 8,
    borderRadius: 28,
  },
  registerButton: {
    marginTop: 8,
    borderRadius: 28,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginButton: {
    marginTop: 4,
  },
});