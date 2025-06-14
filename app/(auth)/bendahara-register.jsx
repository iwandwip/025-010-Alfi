import React, { useState } from "react";
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { 
  Surface, 
  Text, 
  TextInput, 
  Button, 
  IconButton,
  useTheme,
  Avatar,
  Card,
  Divider,
  ProgressBar
} from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { signUpWithEmail } from "../../services/authService";
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';

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
  const theme = useTheme();

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
      colors={[theme.colors.primaryContainer, theme.colors.surface]}
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
          <Animated.View entering={FadeInDown.delay(100)}>
            <IconButton
              icon="arrow-left"
              size={28}
              onPress={() => {
                if (currentStep === 1) {
                  router.back();
                } else {
                  setCurrentStep(1);
                }
              }}
              style={styles.backButton}
              iconColor={theme.colors.primary}
            />
          </Animated.View>

          {/* Progress */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.progressSection}>
            <Text variant="labelLarge" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
              Langkah {currentStep} dari 2
            </Text>
            <ProgressBar 
              progress={progress} 
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </Animated.View>

          {/* Logo Section */}
          <Animated.View 
            entering={FadeInDown.delay(300)}
            style={styles.logoSection}
          >
            <Surface style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]} elevation={5}>
              <Avatar.Icon 
                size={80} 
                icon="account-plus" 
                style={{ backgroundColor: 'transparent' }}
                color={theme.colors.onPrimary}
              />
            </Surface>
            
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              Daftar Bendahara
            </Text>
            
            <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Buat akun untuk mengelola jimpitan warga
            </Text>
          </Animated.View>

          {/* Step 1: Account Info */}
          {currentStep === 1 && (
            <Animated.View entering={SlideInRight.springify()}>
              <Card style={styles.formCard} mode="elevated">
                <Card.Content>
                  <View style={styles.stepHeader}>
                    <Avatar.Icon 
                      size={40} 
                      icon="email" 
                      style={{ backgroundColor: theme.colors.primaryContainer }}
                      color={theme.colors.onPrimaryContainer}
                    />
                    <Text variant="titleLarge" style={styles.stepTitle}>
                      Informasi Akun
                    </Text>
                  </View>

                  <TextInput
                    label="Email Bendahara"
                    value={formData.email}
                    onChangeText={(value) => updateForm("email", value)}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    left={<TextInput.Icon icon="email-outline" />}
                    style={styles.input}
                    outlineStyle={{ borderRadius: 16 }}
                  />

                  <TextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(value) => updateForm("password", value)}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    left={<TextInput.Icon icon="lock-outline" />}
                    right={
                      <TextInput.Icon 
                        icon={showPassword ? "eye-off" : "eye"} 
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    style={styles.input}
                    outlineStyle={{ borderRadius: 16 }}
                    helperText="Minimal 6 karakter"
                  />

                  <TextInput
                    label="Konfirmasi Password"
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateForm("confirmPassword", value)}
                    mode="outlined"
                    secureTextEntry={!showConfirmPassword}
                    left={<TextInput.Icon icon="lock-check-outline" />}
                    right={
                      <TextInput.Icon 
                        icon={showConfirmPassword ? "eye-off" : "eye"} 
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                    style={styles.input}
                    outlineStyle={{ borderRadius: 16 }}
                  />

                  <Button
                    mode="contained"
                    onPress={handleNext}
                    style={styles.nextButton}
                    contentStyle={styles.buttonContent}
                    icon="arrow-right"
                  >
                    Lanjutkan
                  </Button>
                </Card.Content>
              </Card>
            </Animated.View>
          )}

          {/* Step 2: Personal Info */}
          {currentStep === 2 && (
            <Animated.View entering={SlideInRight.springify()}>
              <Card style={styles.formCard} mode="elevated">
                <Card.Content>
                  <View style={styles.stepHeader}>
                    <Avatar.Icon 
                      size={40} 
                      icon="account" 
                      style={{ backgroundColor: theme.colors.secondaryContainer }}
                      color={theme.colors.onSecondaryContainer}
                    />
                    <Text variant="titleLarge" style={styles.stepTitle}>
                      Informasi Pribadi
                    </Text>
                  </View>

                  <TextInput
                    label="Nama Lengkap"
                    value={formData.nama}
                    onChangeText={(value) => updateForm("nama", value)}
                    mode="outlined"
                    left={<TextInput.Icon icon="account-outline" />}
                    style={styles.input}
                    outlineStyle={{ borderRadius: 16 }}
                  />

                  <TextInput
                    label="Nomor HP"
                    value={formData.noHp}
                    onChangeText={(value) => updateForm("noHp", value)}
                    mode="outlined"
                    keyboardType="phone-pad"
                    left={<TextInput.Icon icon="phone-outline" />}
                    style={styles.input}
                    outlineStyle={{ borderRadius: 16 }}
                  />

                  <Button
                    mode="contained"
                    onPress={handleRegister}
                    loading={loading}
                    disabled={loading}
                    style={styles.registerButton}
                    contentStyle={styles.buttonContent}
                    icon="account-plus"
                  >
                    {loading ? "Membuat Akun..." : "Daftar Sekarang"}
                  </Button>
                </Card.Content>
              </Card>
            </Animated.View>
          )}

          {/* Login Link */}
          <Animated.View 
            entering={FadeInUp.delay(400)}
            style={styles.loginSection}
          >
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Sudah punya akun bendahara?
            </Text>
            <Button
              mode="text"
              onPress={() => router.push("/(auth)/bendahara-login")}
              style={styles.loginButton}
              labelStyle={{ color: theme.colors.primary }}
            >
              Masuk Sekarang
            </Button>
          </Animated.View>
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