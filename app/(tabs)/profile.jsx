import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import { signOutUser } from "../../services/authService";
import { MaterialIcons } from '@expo/vector-icons';
import { Shadows } from '../../constants/theme';
import { useRoleTheme } from '../../hooks/useRoleTheme';
import Button from '../../components/ui/Button';

function Profile() {
  const { currentUser, userProfile } = useAuth();
  const { colors } = useRoleTheme();
  const styles = createStyles(colors);
  const { theme, loading: settingsLoading } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loggingOut, setLoggingOut] = useState(false);
  // Using custom theme from constants

  const handleLogout = async () => {
    Alert.alert("Konfirmasi Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          const result = await signOutUser();
          if (result.success) {
            router.replace("/role-selection");
          } else {
            Alert.alert("Gagal Logout", "Gagal keluar. Silakan coba lagi.");
          }
          setLoggingOut(false);
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    router.push("/(tabs)/edit-profile");
  };

  if (settingsLoading || !userProfile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, Shadows.md]}>
          <Text style={styles.headerTitle}>
            Profil Warga
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Memuat profil...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primary + '20', colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={[styles.header, Shadows.md]}>
        <Text style={styles.headerTitle}>
          Profil Warga
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Informasi akun dan pengaturan
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
          <View style={[styles.profileCard, Shadows.lg]}>
            <View style={styles.profileContent}>
              <View style={styles.avatarSection}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.avatarText, { color: colors.textInverse }]}>
                    {userProfile?.namaWarga?.charAt(0)?.toUpperCase() || 'W'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {userProfile?.namaWarga || "Nama Warga"}
                </Text>
                
                <View style={[styles.chip, { backgroundColor: colors.secondary + '20' }]}>
                  <MaterialIcons name="person" size={16} color={colors.secondary} />
                  <Text style={[styles.chipText, { color: colors.secondary }]}>
                    Warga RT
                  </Text>
                </View>
              </View>
            </View>
          </View>

        {userProfile && (
          <View style={styles.infoSection}>
            {/* Personal Information */}
              <View style={[styles.infoCard, Shadows.md]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: colors.primary + '20' }]}>
                    <MaterialIcons 
                      name="person" 
                      size={24} 
                      color={colors.primary}
                    />
                  </View>
                  <Text style={styles.cardTitle}>
                    Informasi Warga
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Nama Warga:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {userProfile.namaWarga}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    No HP:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {userProfile.noHpWarga}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Email:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {userProfile.email}
                  </Text>
                </View>
              </View>

            {/* Address & RFID Information */}
              <View style={[styles.infoCard, Shadows.md]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: colors.secondary + '20' }]}>
                    <MaterialIcons 
                      name="location-on" 
                      size={24} 
                      color={colors.secondary}
                    />
                  </View>
                  <Text style={styles.cardTitle}>
                    Informasi Alamat
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Alamat:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text, textAlign: 'right', flex: 1 }]}>
                    {userProfile.alamat || 'Belum diisi'}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Status RFID:
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusIcon, { 
                      backgroundColor: userProfile.rfidWarga ? colors.success + '20' : colors.error + '20' 
                    }]}>
                      <MaterialIcons
                        name={userProfile.rfidWarga ? "check-circle" : "error"}
                        size={16}
                        color={userProfile.rfidWarga ? colors.success : colors.error}
                      />
                    </View>
                    <Text
                      style={[styles.statusText, { 
                        color: userProfile.rfidWarga ? colors.success : colors.error 
                      }]}
                    >
                      {userProfile.rfidWarga ? "Terpasang" : "Belum Terpasang"}
                    </Text>
                  </View>
                </View>

                {userProfile.rfidWarga && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Kode RFID:
                      </Text>
                      <Text
                        style={[styles.infoValue, { 
                          color: colors.text,
                          textAlign: 'right',
                          flex: 1
                        }]}
                      >
                        {userProfile.rfidWarga}
                      </Text>
                    </View>
                  </>
                )}
              </View>

            {/* Account Information */}
              <View style={[styles.infoCard, Shadows.md]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: colors.success + '20' }]}>
                    <MaterialIcons 
                      name="security" 
                      size={24} 
                      color={colors.success}
                    />
                  </View>
                  <Text style={styles.cardTitle}>
                    Informasi Akun
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    User ID:
                  </Text>
                  <Text
                    style={[styles.infoValue, { 
                      color: colors.text,
                      textAlign: 'right',
                      flex: 1,
                      fontSize: 12
                    }]}
                  >
                    {userProfile.id}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Role:
                  </Text>
                  <View style={[styles.chip, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.chipText, { color: colors.primary }]}>
                      {userProfile.role}
                    </Text>
                  </View>
                </View>
              </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            variant="primary"
            onPress={handleEditProfile}
            style={styles.editButton}
          >
            Edit Profil
          </Button>

          <Button
            variant="outline"
            onPress={handleLogout}
            disabled={loggingOut}
            loading={loggingOut}
            style={[styles.logoutButton, { borderColor: colors.error }]}
            textStyle={{ color: colors.error }}
          >
            {loggingOut ? "Sedang Keluar..." : "Keluar"}
          </Button>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  profileCard: {
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 20,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarSection: {
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'center',
    marginTop: 8,
    gap: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoSection: {
    gap: 16,
  },
  infoCard: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  actionSection: {
    marginTop: 24,
    gap: 12,
  },
  editButton: {
    borderRadius: 28,
  },
  logoutButton: {
    borderRadius: 28,
  },
});

export default Profile;
