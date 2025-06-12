import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import Button from "../../components/ui/Button";
import { signOutUser } from "../../services/authService";
import { getColors } from "../../constants/Colors";

function Profile() {
  const { currentUser, userProfile } = useAuth();
  const { theme, loading: settingsLoading } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loggingOut, setLoggingOut] = useState(false);
  const colors = getColors(theme);

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

  if (settingsLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
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
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.profileSection}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.avatarText, { color: colors.white }]}>
                👤
              </Text>
            </View>
            <Text style={[styles.nameText, { color: colors.gray900 }]}>
              {userProfile?.namaWali || "Nama Wali"}
            </Text>
            <Text style={[styles.roleText, { color: colors.gray600 }]}>
              Wali Santri
            </Text>
          </View>

          {userProfile && (
            <View style={styles.profileContainer}>
              <View
                style={[
                  styles.profileCard,
                  {
                    backgroundColor: colors.white,
                    shadowColor: colors.shadow.color,
                  },
                ]}
              >
                <Text style={[styles.cardTitle, { color: colors.gray900 }]}>
                  Informasi Wali Santri
                </Text>

                <View
                  style={[
                    styles.profileRow,
                    { borderBottomColor: colors.gray100 },
                  ]}
                >
                  <Text style={[styles.label, { color: colors.gray600 }]}>
                    Nama Wali:
                  </Text>
                  <Text style={[styles.value, { color: colors.gray900 }]}>
                    {userProfile.namaWali}
                  </Text>
                </View>

                <View
                  style={[
                    styles.profileRow,
                    { borderBottomColor: colors.gray100 },
                  ]}
                >
                  <Text style={[styles.label, { color: colors.gray600 }]}>
                    No HP:
                  </Text>
                  <Text style={[styles.value, { color: colors.gray900 }]}>
                    {userProfile.noHpWali}
                  </Text>
                </View>

                <View
                  style={[
                    styles.profileRow,
                    { borderBottomColor: colors.gray100 },
                  ]}
                >
                  <Text style={[styles.label, { color: colors.gray600 }]}>
                    Email:
                  </Text>
                  <Text style={[styles.value, { color: colors.gray900 }]}>
                    {userProfile.email}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.profileCard,
                  {
                    backgroundColor: colors.white,
                    shadowColor: colors.shadow.color,
                  },
                ]}
              >
                <Text style={[styles.cardTitle, { color: colors.gray900 }]}>
                  Informasi Santri
                </Text>

                <View
                  style={[
                    styles.profileRow,
                    { borderBottomColor: colors.gray100 },
                  ]}
                >
                  <Text style={[styles.label, { color: colors.gray600 }]}>
                    Nama Santri:
                  </Text>
                  <Text style={[styles.value, { color: colors.gray900 }]}>
                    {userProfile.namaSantri}
                  </Text>
                </View>

                <View
                  style={[
                    styles.profileRow,
                    { borderBottomColor: colors.gray100 },
                  ]}
                >
                  <Text style={[styles.label, { color: colors.gray600 }]}>
                    Status RFID:
                  </Text>
                  <Text
                    style={[
                      styles.value,
                      {
                        color: userProfile.rfidSantri
                          ? colors.success
                          : colors.error,
                      },
                    ]}
                  >
                    {userProfile.rfidSantri ? "Terpasang" : "Belum Terpasang"}
                  </Text>
                </View>

                {userProfile.rfidSantri && (
                  <View
                    style={[
                      styles.profileRow,
                      { borderBottomColor: colors.gray100 },
                    ]}
                  >
                    <Text style={[styles.label, { color: colors.gray600 }]}>
                      Kode RFID:
                    </Text>
                    <Text
                      style={[
                        styles.value,
                        styles.rfidCode,
                        { color: colors.gray900 },
                      ]}
                    >
                      {userProfile.rfidSantri}
                    </Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.profileCard,
                  {
                    backgroundColor: colors.white,
                    shadowColor: colors.shadow.color,
                  },
                ]}
              >
                <Text style={[styles.cardTitle, { color: colors.gray900 }]}>
                  Informasi Akun
                </Text>

                <View
                  style={[
                    styles.profileRow,
                    { borderBottomColor: colors.gray100 },
                  ]}
                >
                  <Text style={[styles.label, { color: colors.gray600 }]}>
                    User ID:
                  </Text>
                  <Text
                    style={[
                      styles.value,
                      styles.userId,
                      { color: colors.gray900 },
                    ]}
                  >
                    {userProfile.id}
                  </Text>
                </View>

                <View
                  style={[
                    styles.profileRow,
                    { borderBottomColor: colors.gray100 },
                  ]}
                >
                  <Text style={[styles.label, { color: colors.gray600 }]}>
                    Role:
                  </Text>
                  <Text style={[styles.value, { color: colors.gray900 }]}>
                    {userProfile.role}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.actionsContainer}>
            <Button
              title="Edit Profil"
              onPress={handleEditProfile}
              style={styles.editButton}
            />

            <Button
              title={loggingOut ? "Sedang Keluar..." : "Keluar"}
              onPress={handleLogout}
              variant="outline"
              style={[styles.logoutButton, { borderColor: colors.error }]}
              disabled={loggingOut}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 24,
    paddingTop: 40,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  roleText: {
    fontSize: 14,
  },
  profileContainer: {
    marginBottom: 32,
  },
  profileCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  value: {
    fontSize: 14,
    flex: 2,
    textAlign: "right",
  },
  rfidCode: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  userId: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  actionsContainer: {
    gap: 12,
  },
  editButton: {
    marginBottom: 8,
  },
  logoutButton: {
    marginBottom: 8,
  },
});

export default Profile;
