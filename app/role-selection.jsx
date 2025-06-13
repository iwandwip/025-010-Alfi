import React from "react";
import { useRouter } from "expo-router";
import {
  Box,
  VStack,
  HStack,
  Text,
  Center,
  Pressable,
  Icon,
  Heading,
  useTheme,
  Badge,
  Fade,
} from "native-base";
import { Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RoleSelection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const handleBendaharaPress = () => {
    router.push("/(auth)/bendahara-login");
  };

  const handleWargaPress = () => {
    router.push("/(auth)/warga-login");
  };

  return (
    <Box flex="1" bg="gray.50" safeAreaTop>
      <VStack flex="1" px="6" py="8">
        {/* Header Section */}
        <VStack space="4" alignItems="center" mb="8">
          <Fade in={true} duration="1000">
            <Heading size="2xl" textAlign="center" color="coolGray.800">
              Smart Jimpitan
            </Heading>
          </Fade>
          <Fade in={true} duration="1200">
            <Text 
              fontSize="md" 
              color="coolGray.600" 
              textAlign="center"
              px="4"
              lineHeight="lg"
            >
              Sistem Pengelolaan Jimpitan Warga{"\n"}RT 01 RW 02
            </Text>
          </Fade>
        </VStack>

        {/* Logo Container */}
        <Center mb="10">
          <Fade in={true} duration="1400">
            <Box 
              bg="pink.500" 
              p="8" 
              rounded="full" 
              shadow="8"
              borderWidth={4}
              borderColor="pink.100"
            >
              <Icon 
                as={MaterialIcons} 
                name="savings" 
                size="70" 
                color="white" 
              />
            </Box>
          </Fade>
        </Center>

        {/* Role Selection */}
        <VStack flex="1" justifyContent="center" space="4">
          <Fade in={true} duration="1600">
            <Heading size="md" textAlign="center" color="coolGray.700" mb="4">
              Pilih Peran Anda
            </Heading>
          </Fade>

          {/* Bendahara Card */}
          <Fade in={true} duration="1800">
            <Pressable 
              onPress={handleBendaharaPress}
              _pressed={{ scale: 0.98 }}
            >
              <Box
                bg="white"
                rounded="2xl"
                shadow="4"
                overflow="hidden"
                borderWidth={2}
                borderColor="green.200"
                _pressed={{
                  borderColor: "green.400",
                  shadow: 6
                }}
              >
                <HStack alignItems="center" p="5" space="4">
                  <Box 
                    bg="green.100" 
                    p="4" 
                    rounded="xl"
                  >
                    <Icon 
                      as={MaterialIcons} 
                      name="admin-panel-settings" 
                      size="35" 
                      color="green.600" 
                    />
                  </Box>
                  
                  <VStack flex="1" space="1">
                    <HStack alignItems="center" space="2">
                      <Heading size="sm" color="coolGray.800">
                        Bendahara
                      </Heading>
                      <Badge colorScheme="green" rounded="full" variant="subtle">
                        <Text fontSize="2xs" fontWeight="bold">ADMIN</Text>
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="coolGray.600">
                      Kelola data warga dan setoran jimpitan
                    </Text>
                  </VStack>
                  
                  <Icon 
                    as={MaterialIcons} 
                    name="chevron-right" 
                    size="lg" 
                    color="gray.400" 
                  />
                </HStack>
              </Box>
            </Pressable>
          </Fade>

          {/* Warga Card */}
          <Fade in={true} duration="2000">
            <Pressable 
              onPress={handleWargaPress}
              _pressed={{ scale: 0.98 }}
            >
              <Box
                bg="white"
                rounded="2xl"
                shadow="4"
                overflow="hidden"
                borderWidth={2}
                borderColor="teal.200"
                _pressed={{
                  borderColor: "teal.400",
                  shadow: 6
                }}
              >
                <HStack alignItems="center" p="5" space="4">
                  <Box 
                    bg="teal.100" 
                    p="4" 
                    rounded="xl"
                  >
                    <Icon 
                      as={MaterialIcons} 
                      name="people" 
                      size="35" 
                      color="teal.600" 
                    />
                  </Box>
                  
                  <VStack flex="1" space="1">
                    <HStack alignItems="center" space="2">
                      <Heading size="sm" color="coolGray.800">
                        Warga
                      </Heading>
                      <Badge colorScheme="teal" rounded="full" variant="subtle">
                        <Text fontSize="2xs" fontWeight="bold">USER</Text>
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="coolGray.600">
                      Pantau dan setor jimpitan Anda
                    </Text>
                  </VStack>
                  
                  <Icon 
                    as={MaterialIcons} 
                    name="chevron-right" 
                    size="lg" 
                    color="gray.400" 
                  />
                </HStack>
              </Box>
            </Pressable>
          </Fade>
        </VStack>

        {/* Footer */}
        <Center pt="8">
          <Fade in={true} duration="2200">
            <VStack space="1" alignItems="center">
              <HStack alignItems="center" space="2">
                <Icon 
                  as={MaterialIcons} 
                  name="location-on" 
                  size="xs" 
                  color="gray.500" 
                />
                <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                  RT 01 RW 02
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                Kelurahan Sukajadi
              </Text>
            </VStack>
          </Fade>
        </Center>
      </VStack>
    </Box>
  );
}