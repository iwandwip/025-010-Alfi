import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { updateUserProfile } from "../../services/userService";
import { lightTheme } from "../../constants/Colors";

export default function EditProfile() {
  const { userProfile, refreshProfile, isAdmin } = useAuth();
  const { theme, loading: settingsLoading } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const colors = lightTheme;

  const [loading, setLoading] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    alamat: userProfile?.alamat || "",
    noHpWarga: userProfile?.noHpWarga || "",
    namaWarga: userProfile?.namaWarga || "",
  });
  const [tempData, setTempData] = useState({});
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const updateTempData = (field, value) => {
    setTempData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const startEditing = (section, fields) => {
    setEditingSection(section);
    const temp = {};
    fields.forEach(field => {
      temp[field] = formData[field];
    });
    setTempData(temp);
    setErrors({});
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setTempData({});
    setErrors({});
  };

  const saveSection = async (section, fields) => {
    // Validate the specific fields
    const newErrors = {};
    fields.forEach(field => {
      if (!tempData[field]?.trim()) {
        const fieldNames = {
          namaWarga: 'Nama warga',
          alamat: 'Alamat',
          noHpWarga: 'No HP warga'
        };
        newErrors[field] = `${fieldNames[field]} wajib diisi`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const updatedData = { ...formData, ...tempData };
      const result = await updateUserProfile(userProfile.id, updatedData);

      if (result.success) {
        setFormData(updatedData);
        await refreshProfile();
        setEditingSection(null);
        setTempData({});
        Alert.alert(
          "Berhasil Diperbarui",
          "Perubahan telah disimpan!",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Gagal Memperbarui", result.error);
      }
    } catch (error) {
      Alert.alert("Gagal Memperbarui", "Terjadi kesalahan. Silakan coba lagi.");
    }
    setLoading(false);
  };

  const ProfilePhotoSection = () => (
    <View style={[styles.profileSection, { backgroundColor: colors.white }]}>
      <View style={styles.profilePhotoContainer}>
        <View style={[styles.profilePhoto, { backgroundColor: colors.primary }]}>
          <Text style={[styles.profilePhotoText, { color: colors.white }]}>
            {formData.namaWarga?.charAt(0) || userProfile?.email?.charAt(0) || '?'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.gray900 }]}>
            {formData.namaWarga || 'Nama belum diatur'}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.gray600 }]}>
            {userProfile?.email}
          </Text>
        </View>
        <TouchableOpacity style={[styles.editPhotoButton, { backgroundColor: colors.gray100 }]}>
          <Text style={[styles.editPhotoText, { color: colors.primary }]}>
            Edit Foto
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const EditableSection = ({ title, fields, sectionKey, icon }) => {
    const isEditing = editingSection === sectionKey;
    
    return (
      <View style={[styles.editableSection, { backgroundColor: colors.white }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionIcon}>{icon}</Text>
            <Text style={[styles.sectionTitle, { color: colors.gray900 }]}>
              {title}
            </Text>
          </View>
          {!isEditing && (
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={() => startEditing(sectionKey, Object.keys(fields))}
            >
              <Text style={[styles.editButtonText, { color: colors.white }]}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!isEditing ? (
          <View style={styles.previewContainer}>
            {Object.entries(fields).map(([key, label]) => (
              <View key={key} style={styles.previewItem}>
                <Text style={[styles.previewLabel, { color: colors.gray600 }]}>
                  {label}
                </Text>
                <Text style={[styles.previewValue, { color: colors.gray900 }]}>
                  {formData[key] || 'Belum diatur'}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.editContainer}>
            {Object.entries(fields).map(([key, label]) => (
              <Input
                key={key}
                label={label}
                placeholder={`Masukkan ${label.toLowerCase()}`}
                value={tempData[key] || ''}
                onChangeText={(value) => updateTempData(key, value)}
                autoCapitalize={key === 'alamat' || key === 'namaWarga' ? 'words' : 'none'}
                keyboardType={key === 'noHpWarga' ? 'phone-pad' : 'default'}
                error={errors[key]}
              />
            ))}
            
            <View style={styles.editActions}>
              <Button
                title="Batal"
                onPress={cancelEditing}
                variant="outline"
                style={[styles.cancelButton, { borderColor: colors.gray400 }]}
                disabled={loading}
              />
              <Button
                title={loading ? "Menyimpan..." : "Simpan"}
                onPress={() => saveSection(sectionKey, Object.keys(fields))}
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                disabled={loading}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  if (settingsLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { paddingTop: insets.top, backgroundColor: colors.background },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.white,
              borderBottomColor: colors.gray200,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              ← Kembali
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.gray900 }]}>
            Edit Profil
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.gray600 }]}>
            Memuat profil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.white,
              borderBottomColor: colors.gray200,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              ← Kembali
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.gray900 }]}>
            Edit Profil
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
        >
          <ProfilePhotoSection />

          <EditableSection
            title="Informasi Pribadi"
            fields={{ namaWarga: 'Nama Warga' }}
            sectionKey="personal"
            icon="👤"
          />

          <EditableSection
            title="Informasi Kontak"
            fields={{ 
              alamat: 'Alamat',
              noHpWarga: 'No HP Warga'
            }}
            sectionKey="contact"
            icon="📞"
          />

          <View style={[styles.infoSection, { backgroundColor: colors.white }]}>
            <View style={[styles.infoBox, { backgroundColor: colors.primary + '20' }]}>
              <Text style={styles.infoIcon}>🔒</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: colors.primary }]}>
                  Informasi RFID
                </Text>
                <Text style={[styles.infoText, { color: colors.gray600 }]}>
                  RFID warga hanya dapat diatur oleh bendahara melalui sistem pairing
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    gap: 16,
  },
  
  // Profile Photo Section
  profileSection: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  profilePhotoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profilePhotoText: {
    fontSize: 24,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  editPhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editPhotoText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Editable Sections
  editableSection: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Preview Container
  previewContainer: {
    gap: 12,
  },
  previewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: '400',
  },

  // Edit Container
  editContainer: {
    gap: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },

  // Info Section
  infoSection: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
