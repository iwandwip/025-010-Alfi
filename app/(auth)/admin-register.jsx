import React, { useState } from "react";
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
  Animated,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { signUpWithEmail } from "../../services/authService";
import { lightTheme } from "../../constants/Colors";

export default function AdminRegister() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nama: "",
    noHp: "",
  });
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const steps = [
    {
      id: 0,
      title: "Akun",
      subtitle: "Setup akun bendahara",
      icon: "📧",
      fields: ["email"]
    },
    {
      id: 1,
      title: "Keamanan",
      subtitle: "Atur password yang aman",
      icon: "🔒",
      fields: ["password", "confirmPassword"]
    },
    {
      id: 2,
      title: "Profil",
      subtitle: "Informasi personal",
      icon: "👤",
      fields: ["nama", "noHp"]
    }
  ];

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepIndex) => {
    const step = steps[stepIndex];
    
    switch (stepIndex) {
      case 0: // Account step
        if (!formData.email.trim()) {
          Alert.alert("Error", "Email wajib diisi");
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          Alert.alert("Error", "Email tidak valid");
          return false;
        }
        break;
      case 1: // Security step
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
        break;
      case 2: // Profile step
        if (!formData.nama.trim()) {
          Alert.alert("Error", "Nama wajib diisi");
          return false;
        }
        if (!formData.noHp.trim()) {
          Alert.alert("Error", "No HP wajib diisi");
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateForm = () => {
    return validateStep(0) && validateStep(1) && validateStep(2);
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const profileData = {
      nama: formData.nama,
      noHp: formData.noHp,
      role: "admin",
    };

    const result = await signUpWithEmail(
      formData.email,
      formData.password,
      profileData
    );

    if (result.success) {
      Alert.alert("Berhasil", "Akun admin berhasil dibuat!", [
        { text: "OK", onPress: () => router.replace("/(admin)") },
      ]);
    } else {
      Alert.alert("Pendaftaran Gagal", result.error);
    }
    setLoading(false);
  };

  const renderProgressIndicator = () => {
    return (
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepContainer}>
            <View style={[
              styles.stepCircle,
              currentStep === index && styles.stepCircleActive,
              completedSteps.includes(index) && styles.stepCircleCompleted
            ]}>
              <Text style={[
                styles.stepNumber,
                currentStep === index && styles.stepNumberActive,
                completedSteps.includes(index) && styles.stepNumberCompleted
              ]}>
                {completedSteps.includes(index) ? "✓" : index + 1}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                completedSteps.includes(index) && styles.stepLineCompleted
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    return (
      <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepIcon}>{step.icon}</Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
        </View>

        <View style={styles.stepContent}>
          {currentStep === 0 && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldGroupTitle}>Informasi Akun</Text>
              <Input
                label="Email Bendahara"
                placeholder="contoh: bendahara@email.com"
                value={formData.email}
                onChangeText={(value) => updateForm("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.fieldNote}>
                Email ini akan digunakan untuk masuk ke sistem
              </Text>
            </View>
          )}

          {currentStep === 1 && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldGroupTitle}>Keamanan Password</Text>
              <Input
                label="Password"
                placeholder="Masukkan password (min. 6 karakter)"
                value={formData.password}
                onChangeText={(value) => updateForm("password", value)}
                secureTextEntry
              />
              <Input
                label="Konfirmasi Password"
                placeholder="Ulangi password yang sama"
                value={formData.confirmPassword}
                onChangeText={(value) => updateForm("confirmPassword", value)}
                secureTextEntry
              />
              <Text style={styles.fieldNote}>
                Gunakan kombinasi huruf, angka, dan simbol untuk keamanan maksimal
              </Text>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldGroupTitle}>Data Personal</Text>
              <Input
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap bendahara"
                value={formData.nama}
                onChangeText={(value) => updateForm("nama", value)}
                autoCapitalize="words"
              />
              <Input
                label="Nomor HP"
                placeholder="08xxxxxxxxxx"
                value={formData.noHp}
                onChangeText={(value) => updateForm("noHp", value)}
                keyboardType="phone-pad"
              />
              <Text style={styles.fieldNote}>
                Informasi ini akan ditampilkan dalam profil bendahara
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Pendaftaran Bendahara</Text>
            <Text style={styles.subtitle}>
              Setup akun bendahara dalam 3 langkah mudah
            </Text>
          </View>

          {/* Progress Indicator */}
          {renderProgressIndicator()}

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            <View style={styles.buttonRow}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.prevButton}
                  onPress={prevStep}
                >
                  <Text style={styles.prevButtonText}>← Sebelumnya</Text>
                </TouchableOpacity>
              )}
              
              <View style={styles.nextButtonContainer}>
                {currentStep < steps.length - 1 ? (
                  <Button
                    title="Lanjutkan →"
                    onPress={nextStep}
                    style={styles.nextButton}
                  />
                ) : (
                  <Button
                    title={loading ? "Sedang Mendaftar..." : "Selesaikan Pendaftaran"}
                    onPress={handleRegister}
                    disabled={loading}
                    style={styles.completeButton}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Sudah memiliki akun bendahara?</Text>
            <Link href="/(auth)/admin-login" style={styles.loginLink}>
              Masuk Sekarang
            </Link>
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
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    color: lightTheme.secondary,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: lightTheme.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 26,
    marginTop: 4,
  },
  
  // Progress Indicator Styles
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#cbd5e1",
  },
  stepCircleActive: {
    backgroundColor: lightTheme.primary,
    borderColor: lightTheme.primary,
  },
  stepCircleCompleted: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#64748b",
  },
  stepNumberActive: {
    color: "#ffffff",
  },
  stepNumberCompleted: {
    color: "#ffffff",
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: "#16a34a",
  },
  
  // Step Card Styles
  stepCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stepHeader: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  stepIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  stepContent: {
    padding: 24,
  },
  
  // Field Group Styles
  fieldGroup: {
    marginBottom: 8,
  },
  fieldGroupTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  fieldNote: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
    fontStyle: "italic",
  },
  
  // Navigation Styles
  navigationContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prevButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  prevButtonText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  nextButtonContainer: {
    flex: 1,
    marginLeft: 16,
  },
  nextButton: {
    backgroundColor: lightTheme.primary,
  },
  completeButton: {
    backgroundColor: "#16a34a",
  },
  
  // Login Section Styles
  loginSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  loginLink: {
    fontSize: 14,
    color: lightTheme.primary,
    fontWeight: "600",
  },
});
