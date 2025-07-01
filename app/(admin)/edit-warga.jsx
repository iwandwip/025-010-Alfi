import React, { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { getUserProfile, updateUserProfile } from "../../services/userService";

export default function EditWarga() {
  const { wargaId } = useLocalSearchParams();
  const [formData, setFormData] = useState({
    namaWarga: "",
    alamat: "",
    noHpWarga: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadWargaData = async () => {
    setLoading(true);
    const result = await getUserProfile(wargaId);
    if (result.success) {
      const warga = result.profile;
      setFormData({
        namaWarga: warga.namaWarga || "",
        alamat: warga.alamat || "",
        noHpWarga: warga.noHpWarga || "",
        email: warga.email || "",
      });
    } else {
      Alert.alert("Error", "Gagal memuat data warga");
      router.back();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWargaData();
  }, [wargaId]);

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
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
    if (!formData.email.trim()) {
      Alert.alert("Error", "Email warga wajib diisi");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Error", "Format email tidak valid");
      return false;
    }
    return true;
  };

  const handleSimpan = async () => {
    if (!validateForm()) return;

    Alert.alert(
      "Konfirmasi Perubahan",
      "Apakah Anda yakin ingin menyimpan perubahan data warga?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Simpan",
          onPress: async () => {
            setSaving(true);
            const updateData = {
              namaWarga: formData.namaWarga,
              alamat: formData.alamat,
              noHpWarga: formData.noHpWarga,
              email: formData.email,
            };

            const result = await updateUserProfile(wargaId, updateData);

            if (result.success) {
              Alert.alert("Berhasil", "Data warga berhasil diperbarui!", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } else {
              Alert.alert("Gagal", result.error);
            }
            setSaving(false);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Batal</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Data Warga</Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner text="Memuat data warga..." />
        </View>
      </SafeAreaView>
    );
  }

  const renderTabButton = (tabKey, label, icon) => (
    <TouchableOpacity
      key={tabKey}
      style={[styles.tabButton, activeTab === tabKey && styles.activeTab]}
      onPress={() => setActiveTab(tabKey)}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabText, activeTab === tabKey && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderPersonalTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Personal</Text>
        <Input
          label="Nama Warga"
          placeholder="Masukkan nama lengkap warga"
          value={formData.namaWarga}
          onChangeText={(value) => updateForm("namaWarga", value)}
          autoCapitalize="words"
        />
        <Button
          title={saving ? "Menyimpan..." : "Simpan Perubahan"}
          onPress={handleSimpan}
          disabled={saving}
          style={styles.saveButtonTab}
        />
      </View>
    </View>
  );

  const renderContactTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informasi Kontak</Text>
        <Input
          label="Alamat"
          placeholder="Masukkan alamat lengkap"
          value={formData.alamat}
          onChangeText={(value) => updateForm("alamat", value)}
          autoCapitalize="words"
        />
        <Input
          label="No HP Warga"
          placeholder="Masukkan nomor HP warga"
          value={formData.noHpWarga}
          onChangeText={(value) => updateForm("noHpWarga", value)}
          keyboardType="phone-pad"
        />
        <Button
          title={saving ? "Menyimpan..." : "Simpan Perubahan"}
          onPress={handleSimpan}
          disabled={saving}
          style={styles.saveButtonTab}
        />
      </View>
    </View>
  );

  const renderAccountTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Akun Login</Text>
        <Input
          label="Email Warga"
          placeholder="Masukkan email untuk login warga"
          value={formData.email}
          onChangeText={(value) => updateForm("email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ Jika email diubah, warga perlu menggunakan email baru untuk login
          </Text>
        </View>
        <Button
          title={saving ? "Menyimpan..." : "Simpan Perubahan"}
          onPress={handleSimpan}
          disabled={saving}
          style={styles.saveButtonTab}
        />
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return renderPersonalTab();
      case "contact":
        return renderContactTab();
      case "account":
        return renderAccountTab();
      default:
        return renderPersonalTab();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Data Warga</Text>
        </View>

        {/* Profile Preview Section */}
        <View style={styles.profilePreview}>
          <View style={styles.profileCard}>
            <View style={styles.profileIconContainer}>
              <Text style={styles.profileIcon}>👤</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{formData.namaWarga || "Nama Warga"}</Text>
              <Text style={styles.profileEmail}>{formData.email || "email@domain.com"}</Text>
              <Text style={styles.profilePhone}>{formData.noHpWarga || "No HP"}</Text>
            </View>
          </View>
        </View>

        {/* Warning Box */}
        <View style={styles.warningContainer}>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Perubahan data akan mempengaruhi akun login warga
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {renderTabButton("personal", "Personal", "👤")}
          {renderTabButton("contact", "Kontak", "📍")}
          {renderTabButton("account", "Akun", "🔐")}
        </View>

        {/* Tab Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
        >
          {renderTabContent()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    backgroundColor: "#002245",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Profile Preview Styles
  profilePreview: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#002245",
  },
  profileIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#002245",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileIcon: {
    fontSize: 24,
    color: "#ffffff",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#002245",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: "#64748b",
  },

  // Warning Box Styles
  warningContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  warningBox: {
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  warningText: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
    textAlign: "center",
  },

  // Tab Navigation Styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "#002245",
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  activeTabText: {
    color: "#ffffff",
  },

  // Tab Content Styles
  scrollView: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  tabContent: {
    flex: 1,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#002245",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#002245",
  },

  // Info Box Styles
  infoBox: {
    backgroundColor: "#e0f2fe",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#0284c7",
  },
  infoText: {
    fontSize: 14,
    color: "#0369a1",
    lineHeight: 20,
  },

  // Button Styles
  saveButtonTab: {
    backgroundColor: "#002245",
    marginTop: 16,
  },
});
