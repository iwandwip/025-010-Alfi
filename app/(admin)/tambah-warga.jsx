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
      {steps.map((step, index) => (
        <View key={step.id} style={styles.stepItem}>
          <View style={styles.stepConnection}>
            {index > 0 && (
              <View style={[
                styles.connectionLine,
                { backgroundColor: currentStep > step.id ? lightTheme.primary : '#e2e8f0' }
              ]} />
            )}
          </View>
          <View style={[
            styles.stepCircle,
            {
              backgroundColor: currentStep >= step.id ? lightTheme.primary : '#f1f5f9',
              borderColor: currentStep >= step.id ? lightTheme.primary : '#cbd5e1'
            }
          ]}>
            <Text style={[
              styles.stepIcon,
              { color: currentStep >= step.id ? '#fff' : '#64748b' }
            ]}>
              {step.icon}
            </Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={[
              styles.stepTitle,
              { color: currentStep >= step.id ? lightTheme.primary : '#64748b' }
            ]}>
              {step.title}
            </Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
        </View>
      ))}
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },

  // Step Indicator Styles
  stepIndicatorContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stepConnection: {
    position: "absolute",
    left: 20,
    top: -16,
    width: 2,
    height: 16,
  },
  connectionLine: {
    flex: 1,
    width: 2,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  stepIcon: {
    fontSize: 16,
    fontWeight: "600",
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 13,
    color: "#64748b",
  },

  // Content Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  stepContent: {
    flex: 1,
  },
  
  // Card Styles
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: lightTheme.primary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  cardContent: {
    padding: 20,
  },

  // Help Text Styles
  helpText: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: lightTheme.primary,
  },
  helpTextContent: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
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
