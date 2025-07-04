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
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "../../components/ui/Input";
import { signUpWithEmail } from "../../services/authService";
import { lightTheme } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";

export default function TambahWarga() {
  const [formData, setFormData] = useState({
    emailWarga: "",
    passwordWarga: "",
    namaWarga: "",
    alamat: "",
    noHpWarga: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // const { userProfile } = useAuth(); // Unused
  const colors = lightTheme; // Consistent theme

  const steps = [
    { id: 1, title: "Info Personal", icon: "👤", description: "Data identitas warga" },
    { id: 2, title: "Kontak", icon: "📞", description: "Informasi kontak" },
    { id: 3, title: "Akun Login", icon: "🔐", description: "Kredensial akses" },
  ];

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.emailWarga.trim()) {
      Alert.alert("Error", "Email warga wajib diisi");
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
      Alert.alert("Error", "Alamat wajib diisi");
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

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      <View style={styles.horizontalStepContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <View style={styles.horizontalStepItem}>
              <View style={[
                styles.horizontalStepCircle,
                {
                  backgroundColor: currentStep >= step.id ? lightTheme.primary : '#f1f5f9',
                  borderColor: currentStep >= step.id ? lightTheme.primary : '#cbd5e1'
                }
              ]}>
                <Text style={[
                  styles.horizontalStepIcon,
                  { color: currentStep >= step.id ? '#fff' : '#64748b' }
                ]}>
                  {step.icon}
                </Text>
              </View>
              <Text style={[
                styles.horizontalStepTitle,
                { color: currentStep >= step.id ? lightTheme.primary : '#64748b' }
              ]}>
                {step.title}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.horizontalConnectionLine,
                { backgroundColor: currentStep > step.id ? lightTheme.primary : '#e2e8f0' }
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.sectionCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>👤</Text>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>Informasi Personal</Text>
                  <Text style={styles.cardSubtitle}>Masukkan data identitas warga</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <Input
                  label="Nama Lengkap Warga"
                  placeholder="Contoh: Budi Santoso"
                  value={formData.namaWarga}
                  onChangeText={(value) => updateForm("namaWarga", value)}
                  autoCapitalize="words"
                />
                <View style={styles.helpText}>
                  <Text style={styles.helpTextContent}>
                    💡 Gunakan nama lengkap sesuai KTP untuk kemudahan identifikasi
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={styles.sectionCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>📍</Text>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>Alamat Tempat Tinggal</Text>
                  <Text style={styles.cardSubtitle}>Lokasi domisili warga</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <Input
                  label="Alamat Lengkap"
                  placeholder="Jl. Contoh No. 123, RT/RW 01/02, Kelurahan..."
                  value={formData.alamat}
                  onChangeText={(value) => updateForm("alamat", value)}
                  autoCapitalize="words"
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>📞</Text>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>Nomor Kontak</Text>
                  <Text style={styles.cardSubtitle}>Informasi komunikasi</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <Input
                  label="Nomor HP/WhatsApp"
                  placeholder="08123456789"
                  value={formData.noHpWarga}
                  onChangeText={(value) => updateForm("noHpWarga", value)}
                  keyboardType="phone-pad"
                />
                <View style={styles.helpText}>
                  <Text style={styles.helpTextContent}>
                    💡 Pastikan nomor HP aktif untuk notifikasi pembayaran
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={styles.sectionCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🔐</Text>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>Akun Login</Text>
                  <Text style={styles.cardSubtitle}>Kredensial untuk akses aplikasi</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <Input
                  label="Email Login"
                  placeholder="warga@email.com"
                  value={formData.emailWarga}
                  onChangeText={(value) => updateForm("emailWarga", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label="Password"
                  placeholder="Minimal 6 karakter"
                  value={formData.passwordWarga}
                  onChangeText={(value) => updateForm("passwordWarga", value)}
                  secureTextEntry
                />
                <View style={styles.helpText}>
                  <Text style={styles.helpTextContent}>
                    🔒 Password akan digunakan warga untuk login ke aplikasi
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.importantNote}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteIcon}>ℹ️</Text>
                <Text style={styles.noteTitle}>Informasi Penting</Text>
              </View>
              <Text style={styles.noteContent}>
                RFID warga akan diatur setelah data tersimpan melalui menu Daftar Warga. 
                Pastikan semua data sudah benar sebelum menyimpan.
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.namaWarga.trim() !== "";
      case 2:
        return formData.alamat.trim() !== "" && formData.noHpWarga.trim() !== "";
      case 3:
        return formData.emailWarga.trim() !== "" && formData.passwordWarga.trim() !== "";
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Tambah Data Warga</Text>
            <Text style={styles.headerSubtitle}>
              Langkah {currentStep} dari {steps.length}
            </Text>
          </View>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
        >
          {renderStepContent()}
        </ScrollView>

        {/* Navigation Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
          <View style={styles.footerButtons}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.prevButton}
                onPress={prevStep}
              >
                <Text style={styles.prevButtonText}>← Sebelumnya</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.footerMainButton}>
              {currentStep < 3 ? (
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    !canProceed() && styles.nextButtonDisabled
                  ]}
                  onPress={nextStep}
                  disabled={!canProceed()}
                >
                  <View style={[
                    styles.nextButtonGradient,
                    { backgroundColor: canProceed() ? lightTheme.primary : '#94a3b8' }
                  ]}>
                    <Text style={styles.nextButtonText}>
                      Lanjutkan →
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!canProceed() || loading) && styles.submitButtonDisabled
                  ]}
                  onPress={handleSimpan}
                  disabled={!canProceed() || loading}
                >
                  <View style={[
                    styles.submitButtonGradient,
                    { backgroundColor: canProceed() && !loading ? '#16a34a' : '#94a3b8' }
                  ]}>
                    <Text style={styles.submitButtonText}>
                      {loading ? "Menyimpan..." : "✓ Simpan Data"}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
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
  
  // Modern Header Styles
  header: {
    backgroundColor: lightTheme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },

  // Step Indicator Styles - Horizontal
  stepIndicatorContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  horizontalStepContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  horizontalStepItem: {
    alignItems: "center",
    flex: 1,
  },
  horizontalStepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  horizontalStepIcon: {
    fontSize: 12,
    fontWeight: "600",
  },
  horizontalStepTitle: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  horizontalConnectionLine: {
    height: 2,
    flex: 0.3,
    marginHorizontal: 4,
    marginBottom: 12,
  },

  // Content Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  stepContent: {
    flex: 1,
  },
  
  // Card Styles
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: lightTheme.primary,
    marginBottom: 1,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  cardContent: {
    padding: 12,
  },

  // Help Text Styles
  helpText: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: lightTheme.primary,
  },
  helpTextContent: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 16,
  },

  // Important Note Styles
  importantNote: {
    backgroundColor: "#fef3c7",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  noteIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400e",
  },
  noteContent: {
    fontSize: 14,
    color: "#78350f",
    lineHeight: 20,
  },

  // Footer Navigation Styles
  footer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  footerButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  prevButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },
  prevButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#475569",
  },
  footerMainButton: {
    flex: 1,
    marginLeft: 16,
  },
  
  // Next Button Styles
  nextButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  
  // Submit Button Styles
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
