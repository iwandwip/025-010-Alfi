import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  FlatList,
  Pressable,
  Badge,
  Icon,
  IconButton,
  Center,
} from "native-base";
import { RefreshControl } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NBCard, { NBInfoCard } from "../../components/ui/NBCard";
import NBLoadingSpinner from "../../components/ui/NBLoadingSpinner";
import { getAllWarga } from "../../services/userService";
import { Colors } from "../../constants/Colors";

export default function DaftarWarga() {
  const [wargaList, setWargaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadWarga = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    const result = await getAllWarga();
    if (result.success) {
      setWargaList(result.data);
    } else {
      console.error("Error loading warga:", result.error);
    }

    if (!isRefresh) setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWarga(true);
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadWarga();
    }, [])
  );

  useEffect(() => {
    loadWarga();
  }, []);

  const handleWargaPress = (warga) => {
    router.push({
      pathname: "/(admin)/detail-warga",
      params: { wargaId: warga.id },
    });
  };

  const renderWargaItem = ({ item }) => (
    <NBCard
      variant="outline"
      borderColor={Colors.gray200}
      bg={Colors.white}
      onPress={() => handleWargaPress(item)}
      mb="3"
      p="4"
      shadow="2"
    >
      <HStack alignItems="center" space="4">
        <VStack flex="1" space="1">
          <Heading size="sm" color="gray.900">
            {item.namaWarga}
          </Heading>
          <Text fontSize="xs" color="gray.500" fontStyle="italic">
            {item.email}
          </Text>
          <Text fontSize="sm" color="gray.600">
            Alamat: {item.alamat || 'Belum diisi'}
          </Text>
          <Text fontSize="sm" color="gray.600">
            HP: {item.noHpWarga}
          </Text>
        </VStack>

        <VStack alignItems="center" space="2">
          <Badge
            colorScheme={item.rfidWarga ? "green" : "orange"}
            variant="subtle"
            borderRadius="md"
            px="2"
            py="1"
          >
            <HStack alignItems="center" space="1">
              <Icon
                as={MaterialIcons}
                name={item.rfidWarga ? "check-circle" : "warning"}
                size="3"
                color={item.rfidWarga ? "green.600" : "orange.600"}
              />
              <VStack alignItems="center">
                <Text fontSize="xs" color={item.rfidWarga ? "green.600" : "orange.600"}>
                  RFID
                </Text>
                <Text fontSize="xs" color={item.rfidWarga ? "green.600" : "orange.600"}>
                  {item.rfidWarga ? "Terpasang" : "Belum"}
                </Text>
              </VStack>
            </HStack>
          </Badge>
          <Icon as={MaterialIcons} name="chevron-right" size="6" color="gray.400" />
        </VStack>
      </HStack>
    </NBCard>
  );

  if (loading) {
    return (
      <Box flex="1" bg="gray.50" safeAreaTop>
        <VStack
          px="6"
          py="4"
          bg="white"
          borderBottomWidth="1"
          borderBottomColor="gray.200"
          shadow="2"
        >
          <HStack alignItems="center" space="3" mb="2">
            <IconButton
              icon={<Icon as={MaterialIcons} name="arrow-back" size="6" />}
              onPress={() => router.back()}
              variant="ghost"
              colorScheme="green"
              _pressed={{ bg: "green.100" }}
            />
            <Heading size="md" color="gray.900" flex="1" textAlign="center">
              Daftar Warga
            </Heading>
            <Box w="10" />
          </HStack>
        </VStack>
        <NBLoadingSpinner text="Memuat data warga..." />
      </Box>
    );
  }

  return (
    <Box flex="1" bg="gray.50" safeAreaTop>
      <VStack
        px="6"
        py="4"
        bg="white"
        borderBottomWidth="1"
        borderBottomColor="gray.200"
        shadow="2"
      >
        <HStack alignItems="center" space="3" mb="2">
          <IconButton
            icon={<Icon as={MaterialIcons} name="arrow-back" size="6" />}
            onPress={() => router.back()}
            variant="ghost"
            colorScheme="green"
            _pressed={{ bg: "green.100" }}
          />
          <Heading size="md" color="gray.900" flex="1" textAlign="center">
            Daftar Warga
          </Heading>
          <Box w="10" />
        </HStack>
      </VStack>

      <Box flex="1" px="6" pt="4">
        <VStack space="5" flex="1">
          <NBInfoCard
            title="Total Warga"
            value={wargaList.length.toString()}
            icon="groups"
            color={Colors.primary}
          >
            <Text fontSize="sm" color="gray.600" mt="2">
              RFID Terpasang: {wargaList.filter((w) => w.rfidWarga).length} |
              Belum: {wargaList.filter((w) => !w.rfidWarga).length}
            </Text>
          </NBInfoCard>

          {wargaList.length === 0 ? (
            <Center flex="1">
              <VStack alignItems="center" space="3">
                <Icon as={MaterialIcons} name="group-off" size="16" color="gray.400" />
                <Heading size="md" color="gray.600" textAlign="center">
                  Belum ada warga terdaftar
                </Heading>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Tambah warga baru melalui menu Tambah Data Warga
                </Text>
              </VStack>
            </Center>
          ) : (
            <FlatList
              data={wargaList}
              renderItem={renderWargaItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: insets.bottom + 24,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#10b981"]}
                  tintColor="#10b981"
                />
              }
            />
          )}
        </VStack>
      </Box>
    </Box>
  );
}

const styles = {};