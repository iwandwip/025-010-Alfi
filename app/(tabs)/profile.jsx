import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import {
  Surface,
  Text,
  Card,
  Avatar,
  Button,
  Chip,
  IconButton,
  useTheme,
  ActivityIndicator,
  Divider
} from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import { signOutUser } from "../../services/authService";
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';

function Profile() {
  const { currentUser, userProfile } = useAuth();
  const { theme, loading: settingsLoading } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loggingOut, setLoggingOut] = useState(false);
  const paperTheme = useTheme();

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
      <View style={[styles.container, { backgroundColor: paperTheme.colors.background, paddingTop: insets.top }]}>
        <Surface style={styles.header} elevation={2}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Profil Warga
          </Text>
        </Surface>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" animating />
          <Text variant="bodyLarge" style={{ marginTop: 16 }}>
            Memuat profil...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[paperTheme.colors.primaryContainer, paperTheme.colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Profil Warga
        </Text>
        <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
          Informasi akun dan pengaturan
        </Text>
      </Surface>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Card style={styles.profileCard} mode="elevated">
            <Card.Content style={styles.profileContent}>
              <View style={styles.avatarSection}>
                <Avatar.Text 
                  size={80} 
                  label={userProfile?.namaWarga?.charAt(0)?.toUpperCase() || 'W'}
                  style={{ backgroundColor: paperTheme.colors.primary }}
                  color={paperTheme.colors.onPrimary}
                />
              </View>
              
              <View style={styles.profileInfo}>
                <Text variant="headlineSmall" style={[styles.profileName, { color: paperTheme.colors.onSurface }]}>
                  {userProfile?.namaWarga || "Nama Warga"}
                </Text>
                
                <Chip 
                  icon="account" 
                  mode="flat"
                  style={{ backgroundColor: paperTheme.colors.secondaryContainer, alignSelf: 'center', marginTop: 8 }}
                  textStyle={{ color: paperTheme.colors.onSecondaryContainer }}
                >
                  Warga RT
                </Chip>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {userProfile && (
          <View style={styles.infoSection}>
            {/* Personal Information */}
            <Animated.View entering={SlideInRight.delay(200)}>
              <Card style={styles.infoCard} mode="outlined">
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Avatar.Icon 
                      size={40} 
                      icon="account-details" 
                      style={{ backgroundColor: paperTheme.colors.primaryContainer }}
                      color={paperTheme.colors.onPrimaryContainer}
                    />
                    <Text variant="titleLarge" style={styles.cardTitle}>
                      Informasi Warga
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      Nama Warga:
                    </Text>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: paperTheme.colors.onSurface }}>
                      {userProfile.namaWarga}
                    </Text>
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      No HP:
                    </Text>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: paperTheme.colors.onSurface }}>
                      {userProfile.noHpWarga}
                    </Text>
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      Email:
                    </Text>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: paperTheme.colors.onSurface }}>
                      {userProfile.email}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>

            {/* Address & RFID Information */}
            <Animated.View entering={SlideInRight.delay(300)}>
              <Card style={styles.infoCard} mode="outlined">
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Avatar.Icon 
                      size={40} 
                      icon="map-marker" 
                      style={{ backgroundColor: paperTheme.colors.secondaryContainer }}
                      color={paperTheme.colors.onSecondaryContainer}
                    />
                    <Text variant="titleLarge" style={styles.cardTitle}>
                      Informasi Alamat
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      Alamat:
                    </Text>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: paperTheme.colors.onSurface, textAlign: 'right', flex: 1 }}>
                      {userProfile.alamat || 'Belum diisi'}
                    </Text>
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      Status RFID:
                    </Text>
                    <View style={styles.statusRow}>
                      <Avatar.Icon
                        size={24}
                        icon={userProfile.rfidWarga ? "check-circle" : "alert-circle"}
                        style={{ 
                          backgroundColor: userProfile.rfidWarga ? paperTheme.colors.successContainer : paperTheme.colors.errorContainer 
                        }}
                        color={userProfile.rfidWarga ? paperTheme.colors.onSuccessContainer : paperTheme.colors.onErrorContainer}
                      />
                      <Text
                        variant="bodyMedium"
                        style={{ 
                          fontWeight: 'bold', 
                          color: userProfile.rfidWarga ? paperTheme.colors.success : paperTheme.colors.error 
                        }}
                      >
                        {userProfile.rfidWarga ? "Terpasang" : "Belum Terpasang"}
                      </Text>
                    </View>
                  </View>

                  {userProfile.rfidWarga && (
                    <>
                      <Divider style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                          Kode RFID:
                        </Text>
                        <Text
                          variant="bodyMedium"
                          style={{ 
                            fontWeight: 'bold', 
                            color: paperTheme.colors.onSurface,
                            fontFamily: 'monospace',
                            textAlign: 'right',
                            flex: 1
                          }}
                        >
                          {userProfile.rfidWarga}
                        </Text>
                      </View>
                    </>
                  )}
                </Card.Content>
              </Card>
            </Animated.View>

            {/* Account Information */}
            <Animated.View entering={SlideInRight.delay(400)}>
              <Card style={styles.infoCard} mode="outlined">
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Avatar.Icon 
                      size={40} 
                      icon="shield-account" 
                      style={{ backgroundColor: paperTheme.colors.tertiaryContainer }}
                      color={paperTheme.colors.onTertiaryContainer}
                    />
                    <Text variant="titleLarge" style={styles.cardTitle}>
                      Informasi Akun
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      User ID:
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{ 
                        fontWeight: 'bold', 
                        color: paperTheme.colors.onSurface,
                        fontFamily: 'monospace',
                        textAlign: 'right',
                        flex: 1
                      }}
                    >
                      {userProfile.id}
                    </Text>
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.infoRow}>
                    <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                      Role:
                    </Text>
                    <Chip 
                      mode="flat"
                      style={{ backgroundColor: paperTheme.colors.primaryContainer }}
                      textStyle={{ color: paperTheme.colors.onPrimaryContainer }}
                    >
                      {userProfile.role}
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>
          </View>
        )}

        {/* Action Buttons */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.actionSection}>
          <Button
            mode="contained"
            onPress={handleEditProfile}
            style={styles.editButton}
            contentStyle={styles.buttonContent}
            icon="account-edit"
          >
            Edit Profil
          </Button>

          <Button
            mode="outlined"
            onPress={handleLogout}
            disabled={loggingOut}
            loading={loggingOut}
            style={[styles.logoutButton, { borderColor: paperTheme.colors.error }]}
            contentStyle={styles.buttonContent}
            labelStyle={{ color: paperTheme.colors.error }}
            icon="logout"
          >
            {loggingOut ? "Sedang Keluar..." : "Keluar"}
          </Button>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
    fontWeight: '700',
    textAlign: 'center',
  },
  infoSection: {
    gap: 16,
  },
  infoCard: {
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
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
  buttonContent: {
    paddingVertical: 8,
  },
});

export default Profile;
