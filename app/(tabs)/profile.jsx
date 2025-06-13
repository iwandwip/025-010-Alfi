import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  Avatar,
  Badge,
  Icon,
  Center,
} from "native-base";
import { Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import NBCard from "../../components/ui/NBCard";
import NBButton from "../../components/ui/NBButton";
import NBLoadingSpinner from "../../components/ui/NBLoadingSpinner";
import { signOutUser } from "../../services/authService";
import { getColors } from "../../constants/Colors";
import { Colors } from "../../constants/Colors";

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

  if (settingsLoading || !userProfile) {
    return (
      <Box flex={1} bg={colors.background} safeAreaTop>
        <NBLoadingSpinner text="Memuat profil..." />
      </Box>
    );
  }

  return (
    <Box flex={1} bg={colors.background} safeAreaTop>
      <ScrollView
        showsVerticalScrollIndicator={false}
        _contentContainerStyle={{
          p: 6,
          pt: 10,
          pb: insets.bottom + 6,
        }}
      >
        <VStack space={8}>
          <Center>
            <VStack alignItems="center" space={4}>
              <Avatar
                size="xl"
                bg="teal.600"
                source={{
                  uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.namaWarga || 'W')}&background=14b8a6&color=ffffff&size=200`,
                }}
              >
                <Icon as={MaterialIcons} name="person" size={10} color="white" />
              </Avatar>
              <VStack alignItems="center">
                <Heading size="lg" color={colors.gray900} textAlign="center">
                  {userProfile?.namaWarga || "Nama Warga"}
                </Heading>
                <Badge
                  colorScheme="teal"
                  variant="subtle"
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  <HStack alignItems="center" space={1}>
                    <Icon as={MaterialIcons} name="person" size={3} color="teal.600" />
                    <Text fontSize="sm" color="teal.600">Warga</Text>
                  </HStack>
                </Badge>
              </VStack>
            </VStack>
          </Center>

          {userProfile && (
            <VStack space={4}>
              <NBCard
                title="Informasi Warga"
                icon="person"
                variant="elevated"
                shadow={3}
                bg={colors.white}
              >
                <VStack space={3}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.gray600}>
                      Nama Warga:
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color={colors.gray900} flex={1} textAlign="right">
                      {userProfile.namaWarga}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.gray600}>
                      No HP:
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color={colors.gray900} flex={1} textAlign="right">
                      {userProfile.noHpWarga}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.gray600}>
                      Email:
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color={colors.gray900} flex={1} textAlign="right">
                      {userProfile.email}
                    </Text>
                  </HStack>
                </VStack>
              </NBCard>

              <NBCard
                title="Informasi Alamat"
                icon="location-on"
                variant="elevated"
                shadow={3}
                bg={colors.white}
              >
                <VStack space={3}>
                  <HStack justifyContent="space-between" alignItems="flex-start">
                    <Text fontSize="sm" color={colors.gray600}>
                      Alamat:
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color={colors.gray900} flex={1} textAlign="right">
                      {userProfile.alamat || 'Belum diisi'}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.gray600}>
                      Status RFID:
                    </Text>
                    <HStack alignItems="center" space={2}>
                      <Icon
                        as={MaterialIcons}
                        name={userProfile.rfidWarga ? "check-circle" : "cancel"}
                        size={4}
                        color={userProfile.rfidWarga ? "green.500" : "red.500"}
                      />
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        color={userProfile.rfidWarga ? "green.600" : "red.500"}
                      >
                        {userProfile.rfidWarga ? "Terpasang" : "Belum Terpasang"}
                      </Text>
                    </HStack>
                  </HStack>

                  {userProfile.rfidWarga && (
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm" color={colors.gray600}>
                        Kode RFID:
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        color={colors.gray900}
                        fontFamily="mono"
                        flex={1}
                        textAlign="right"
                      >
                        {userProfile.rfidWarga}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </NBCard>

              <NBCard
                title="Informasi Akun"
                icon="admin-panel-settings"
                variant="elevated"
                shadow={3}
                bg={colors.white}
              >
                <VStack space={3}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.gray600}>
                      User ID:
                    </Text>
                    <Text
                      fontSize="xs"
                      fontWeight="600"
                      color={colors.gray900}
                      fontFamily="mono"
                      flex={1}
                      textAlign="right"
                    >
                      {userProfile.id}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.gray600}>
                      Role:
                    </Text>
                    <Badge
                      colorScheme="teal"
                      variant="subtle"
                      borderRadius="full"
                      px={2}
                      py={1}
                    >
                      <Text fontSize="xs" color="teal.600">
                        {userProfile.role}
                      </Text>
                    </Badge>
                  </HStack>
                </VStack>
              </NBCard>
            </VStack>
          )}

          <VStack space={3}>
            <NBButton
              title="Edit Profil"
              onPress={handleEditProfile}
              variant="primary"
              leftIcon={<Icon as={MaterialIcons} name="edit" size={5} color="white" />}
            />

            <NBButton
              title={loggingOut ? "Sedang Keluar..." : "Keluar"}
              onPress={handleLogout}
              variant="outline"
              style={{ borderColor: colors.error }}
              disabled={loggingOut}
              leftIcon={<Icon as={MaterialIcons} name="logout" size={5} color={colors.error} />}
            />
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}

const styles = {
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
};

export default Profile;
