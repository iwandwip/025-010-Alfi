import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  Pressable,
  Modal,
  Input,
  Icon,
  Badge,
  Spinner,
  Center,
  IconButton,
  Divider,
  useToast,
} from "native-base";
import { RefreshControl, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import NBCard from "../../components/ui/NBCard";
import NBButton from "../../components/ui/NBButton";
import NBInput from "../../components/ui/NBInput";
import NBLoadingSpinner from "../../components/ui/NBLoadingSpinner";
import { signOutUser } from "../../services/authService";
import { seederService } from "../../services/seederService";
import { Colors } from "../../constants/Colors";

function AdminHome() {
  const { currentUser, userProfile } = useAuth();
  const { showGeneralNotification } = useNotification();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loggingOut, setLoggingOut] = useState(false);
  const [seederLoading, setSeederLoading] = useState(false);
  const [seederModalVisible, setSeederModalVisible] = useState(false);
  const [seederCount, setSeederCount] = useState("3");
  const [refreshing, setRefreshing] = useState(false);
  const [seederStats, setSeederStats] = useState({
    total: 0,
    seederUsers: 0,
    highestUserNumber: 0,
    nextUserNumber: 1,
  });

  useEffect(() => {
    loadSeederStats();
  }, []);

  const loadSeederStats = async () => {
    try {
      const stats = await seederService.getSeederStats();
      setSeederStats(stats);
    } catch (error) {
      console.error("Error loading seeder stats:", error);
      showGeneralNotification(
        "Error",
        "Gagal memuat statistik seeder",
        "error"
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSeederStats();
      showGeneralNotification(
        "Data Diperbarui",
        "Statistik seeder berhasil dimuat ulang",
        "success",
        { duration: 2000 }
      );
    } catch (error) {
      showGeneralNotification(
        "Error",
        "Gagal memuat ulang data",
        "error"
      );
    } finally {
      setRefreshing(false);
    }
  };

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
            showGeneralNotification(
              "Gagal Logout",
              "Gagal keluar. Silakan coba lagi.",
              "error"
            );
          }
          setLoggingOut(false);
        },
      },
    ]);
  };

  const handleSeeder = () => {
    setSeederModalVisible(true);
  };

  const handleSeederConfirm = async () => {
    const count = parseInt(seederCount);

    if (isNaN(count) || count < 1 || count > 10) {
      Alert.alert("Error", "Jumlah akun harus antara 1-10");
      return;
    }

    setSeederModalVisible(false);

    const nextUser = seederStats.nextUserNumber;
    const emailList = [];
    for (let i = 0; i < count; i++) {
      emailList.push(`user${nextUser + i}@gmail.com`);
    }

    Alert.alert(
      "Generate Data Warga",
      `Akan membuat ${count} akun warga baru:\n${emailList.join(
        ", "
      )}\n\nLanjutkan?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Generate",
          onPress: async () => {
            setSeederLoading(true);

            try {
              const result = await seederService.createSeederUsers(count);

              if (result.success) {
                await loadSeederStats();

                let message = `✅ Berhasil membuat ${result.totalCreated} akun warga!\n\n`;

                result.created.forEach((user, index) => {
                  message += `${index + 1}. ${user.namaWarga}\n`;
                  message += `   Email: ${user.email}\n`;
                  message += `   Warga: ${user.namaWarga}\n`;
                  message += `   RFID: ${user.rfidWarga}\n\n`;
                });

                message += `Password semua akun: admin123`;

                if (result.totalErrors > 0) {
                  message += `\n\n⚠️ ${result.totalErrors} akun gagal dibuat`;
                }

                showGeneralNotification(
                  "Seeder Berhasil",
                  `Berhasil membuat ${result.totalCreated} akun warga baru`,
                  "success",
                  { duration: 5000 }
                );

                Alert.alert("Detail Seeder", message);
              } else {
                showGeneralNotification(
                  "Seeder Gagal",
                  result.error || "Terjadi kesalahan saat generate data",
                  "error"
                );
              }
            } catch (error) {
              showGeneralNotification(
                "Error",
                "Terjadi kesalahan: " + error.message,
                "error"
              );
            } finally {
              setSeederLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleTambahWarga = () => {
    router.push("/(admin)/tambah-warga");
  };

  const handleDaftarWarga = () => {
    router.push("/(admin)/daftar-warga");
  };

  const handleTimelineManager = () => {
    router.push("/(admin)/timeline-manager");
  };

  const handleCekPembayaran = () => {
    router.push("/(admin)/payment-status");
  };

  return (
    <Box flex="1" bg="gray.50" safeAreaTop>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
            title="Tarik untuk memuat ulang..."
            titleColor="#6b7280"
          />
        }
        _contentContainerStyle={{
          px: 6,
          pt: 10,
          pb: insets.bottom + 10,
        }}
      >
        <VStack alignItems="center" mb="10">
          <Heading size="lg" color="gray.900">
            Dashboard Bendahara
          </Heading>
          <Text fontSize="md" color="gray.600" mt="1">
            RT 01 RW 02
          </Text>
          {userProfile && (
            <Text fontSize="sm" color="green.600" fontWeight="500" mt="2">
              Selamat datang, {userProfile.nama}
            </Text>
          )}
        </VStack>

        <VStack space="4" mb="10">
          <NBCard
            variant="elevated"
            borderColor="blue.400"
            onPress={handleTambahWarga}
            p="5"
            shadow="3"
          >
            <HStack alignItems="center" space="4">
              <Box
                bg="blue.100"
                p="3"
                rounded="full"
              >
                <Icon as={MaterialIcons} name="person-add" size="8" color="blue.600" />
              </Box>
              <VStack flex="1">
                <Heading size="sm" color="gray.900">
                  Tambah Data Warga
                </Heading>
                <Text fontSize="sm" color="gray.600" mt="1">
                  Daftarkan warga baru dan buat akun warga
                </Text>
              </VStack>
              <Icon as={MaterialIcons} name="chevron-right" size="6" color="gray.400" />
            </HStack>
          </NBCard>

          <NBCard
            variant="elevated"
            borderColor="green.400"
            onPress={handleDaftarWarga}
            p="5"
            shadow="3"
          >
            <HStack alignItems="center" space="4">
              <Box
                bg="green.100"
                p="3"
                rounded="full"
              >
                <Icon as={MaterialIcons} name="list-alt" size="8" color="green.600" />
              </Box>
              <VStack flex="1">
                <Heading size="sm" color="gray.900">
                  Daftar Warga
                </Heading>
                <Text fontSize="sm" color="gray.600" mt="1">
                  Lihat dan kelola data warga yang terdaftar
                </Text>
              </VStack>
              <Icon as={MaterialIcons} name="chevron-right" size="6" color="gray.400" />
            </HStack>
          </NBCard>

          <NBCard
            variant="elevated"
            borderColor="amber.400"
            onPress={handleTimelineManager}
            p="5"
            shadow="3"
          >
            <HStack alignItems="center" space="4">
              <Box
                bg="amber.100"
                p="3"
                rounded="full"
              >
                <Icon as={MaterialIcons} name="event" size="8" color="amber.600" />
              </Box>
              <VStack flex="1">
                <Heading size="sm" color="gray.900">
                  Timeline Manager
                </Heading>
                <Text fontSize="sm" color="gray.600" mt="1">
                  Kelola timeline dan setoran jimpitan
                </Text>
              </VStack>
              <Icon as={MaterialIcons} name="chevron-right" size="6" color="gray.400" />
            </HStack>
          </NBCard>

          <NBCard
            variant="elevated"
            borderColor="purple.400"
            onPress={handleCekPembayaran}
            p="5"
            shadow="3"
          >
            <HStack alignItems="center" space="4">
              <Box
                bg="purple.100"
                p="3"
                rounded="full"
              >
                <Icon as={MaterialIcons} name="account-balance-wallet" size="8" color="purple.600" />
              </Box>
              <VStack flex="1">
                <Heading size="sm" color="gray.900">
                  Cek Status Setoran
                </Heading>
                <Text fontSize="sm" color="gray.600" mt="1">
                  Lihat status setoran jimpitan semua warga
                </Text>
              </VStack>
              <Icon as={MaterialIcons} name="chevron-right" size="6" color="gray.400" />
            </HStack>
          </NBCard>

          <NBCard
            variant="elevated"
            bg={seederLoading ? "orange.50" : "red.50"}
            borderColor={seederLoading ? "orange.400" : "red.400"}
            onPress={handleSeeder}
            p="5"
            shadow="3"
            opacity={seederLoading ? 0.7 : 1}
            isDisabled={seederLoading}
          >
            <HStack alignItems="center" space="4">
              <Box
                bg={seederLoading ? "orange.100" : "red.100"}
                p="3"
                rounded="full"
              >
                {seederLoading ? (
                  <Spinner size="sm" color="orange.600" />
                ) : (
                  <Icon as={MaterialIcons} name="casino" size="8" color="red.600" />
                )}
              </Box>
              <VStack flex="1">
                <Heading size="sm" color="gray.900">
                  {seederLoading ? "Generating Data..." : "Generate Data Warga"}
                </Heading>
                <Text fontSize="sm" color="gray.600" mt="1">
                  {seederLoading
                    ? "Sedang membuat akun warga dengan data sequential..."
                    : "Buat akun warga dengan email sequential untuk testing"}
                </Text>
                <VStack mt="2">
                  <Text fontSize="xs" color="red.600" fontWeight="500">
                    Total Warga: {seederStats.total} | Generated: {seederStats.seederUsers}
                  </Text>
                  <Text fontSize="xs" color="green.600" fontWeight="600">
                    Next: user{seederStats.nextUserNumber}@gmail.com
                  </Text>
                </VStack>
              </VStack>
              <Icon 
                as={MaterialIcons} 
                name={seederLoading ? "hourglass-empty" : "chevron-right"} 
                size="6" 
                color={seederLoading ? "orange.400" : "gray.400"} 
              />
            </HStack>
          </NBCard>
        </VStack>

        <Box mb="5">
          <NBButton
            title={loggingOut ? "Sedang Keluar..." : "Keluar"}
            onPress={handleLogout}
            variant="outline"
            disabled={loggingOut}
            colorScheme="red"
            leftIcon={<Icon as={MaterialIcons} name="logout" size="5" color="red.500" />}
          />
        </Box>
      </ScrollView>

      <Modal
        isOpen={seederModalVisible}
        onClose={() => !seederLoading && setSeederModalVisible(false)}
        size="lg"
      >
        <Modal.Content maxWidth="400px">
          <Modal.Header>
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="md">Generate Data Warga</Heading>
              <IconButton
                icon={<Icon as={MaterialIcons} name="close" size="5" />}
                onPress={() => setSeederModalVisible(false)}
                variant="ghost"
                colorScheme="gray"
                _pressed={{ bg: "gray.100" }}
              />
            </HStack>
          </Modal.Header>

          <Modal.Body>
            <VStack space="4">
              <VStack>
                <Text fontSize="md" fontWeight="600" color="gray.700" mb="3">
                  Jumlah Akun (1-10):
                </Text>
                <NBInput
                  value={seederCount}
                  onChangeText={setSeederCount}
                  keyboardType="numeric"
                  placeholder="Masukkan jumlah"
                  textAlign="center"
                  fontSize="lg"
                  maxLength="2"
                />
              </VStack>

              <Box bg="gray.50" p="4" rounded="lg">
                <Text fontSize="sm" fontWeight="600" color="gray.700" mb="2">
                  Preview Email:
                </Text>
                {(() => {
                  const count = parseInt(seederCount) || 0;
                  if (count >= 1 && count <= 10) {
                    const emails = [];
                    for (let i = 0; i < count; i++) {
                      emails.push(
                        `user${seederStats.nextUserNumber + i}@gmail.com`
                      );
                    }
                    return emails.map((email, index) => (
                      <Text key={index} fontSize="xs" color="green.600" fontFamily="mono" mb={1}>
                        {email}
                      </Text>
                    ));
                  }
                  return (
                    <Text fontSize="sm" color="red.500" fontStyle="italic">
                      Jumlah harus 1-10
                    </Text>
                  );
                })()}
              </Box>
            </VStack>
          </Modal.Body>

          <Modal.Footer>
            <HStack space="3">
              <NBButton
                title="Batal"
                onPress={() => setSeederModalVisible(false)}
                variant="outline"
                flex="1"
              />
              <NBButton
                title="Generate"
                onPress={handleSeederConfirm}
                variant="primary"
                flex="1"
              />
            </HStack>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      <Modal isOpen={seederLoading} size="lg">
        <Modal.Content maxWidth="350px">
          <Modal.Body>
            <Center py="8">
              <VStack space="4" alignItems="center">
                <Spinner size="lg" color="red.600" />
                <Heading size="md" textAlign="center" color="gray.900">
                  Generating Data Warga
                </Heading>
                <Text fontSize="sm" textAlign="center" color="gray.600">
                  Membuat {seederCount} akun dengan email sequential...
                </Text>
                <Text fontSize="xs" textAlign="center" color="green.600" fontWeight="600">
                  Next: user{seederStats.nextUserNumber}@gmail.com
                </Text>
              </VStack>
            </Center>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </Box>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  menuSection: {
    gap: 16,
    marginBottom: 40,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
  },
  primaryCard: {
    borderColor: "#3b82f6",
  },
  secondaryCard: {
    borderColor: "#10b981",
  },
  tertiaryCard: {
    borderColor: "#f59e0b",
  },
  quaternaryCard: {
    borderColor: "#8b5cf6",
  },
  seederCard: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  seederCardLoading: {
    opacity: 0.7,
    borderColor: "#f97316",
    backgroundColor: "#fff7ed",
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuIconText: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  menuDesc: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 8,
  },
  seederStats: {
    marginTop: 4,
  },
  seederStatsText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "500",
  },
  seederNextText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
    marginTop: 2,
  },
  menuArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 20,
    color: "#94a3b8",
  },
  logoutSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  logoutButton: {
    borderColor: "#ef4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 20,
  },
  previewSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  previewEmail: {
    fontSize: 12,
    color: "#059669",
    fontFamily: "monospace",
    marginBottom: 2,
  },
  previewError: {
    fontSize: 12,
    color: "#ef4444",
    fontStyle: "italic",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingModal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    minWidth: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  loadingNote: {
    fontSize: 12,
    color: "#059669",
    textAlign: "center",
    fontWeight: "600",
  },
};

export default AdminHome;
