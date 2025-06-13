import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  Box,
  VStack,
  HStack,
  Text,
  Center,
  KeyboardAvoidingView,
  ScrollView,
  useTheme,
  Pressable,
  Icon,
  Alert as NBAlert,
  Heading,
  Link,
} from "native-base";
import { Platform, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NBInput from "../../components/ui/NBInput";
import NBButton from "../../components/ui/NBButton";
import { signInWithEmail } from "../../services/authService";

export default function BendaharaLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Mohon isi email dan password");
      return;
    }

    setLoading(true);
    const result = await signInWithEmail(email, password);

    if (result.success) {
      router.replace("/(admin)");
    } else {
      Alert.alert("Masuk Gagal", result.error);
    }
    setLoading(false);
  };

  return (
    <Box flex="1" bg="green.50" safeAreaTop>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <VStack flex="1" px="6">
            {/* Header */}
            <HStack py="4" alignItems="center">
              <Pressable onPress={() => router.back()}>
                <HStack alignItems="center" space="1">
                  <Icon 
                    as={MaterialIcons} 
                    name="arrow-back" 
                    size="md" 
                    color="green.700" 
                  />
                  <Text color="green.700" fontSize="md" fontWeight="medium">
                    Kembali
                  </Text>
                </HStack>
              </Pressable>
            </HStack>

            {/* Content */}
            <VStack flex="1" justifyContent="center" space="8">
              {/* Logo/Illustration Area */}
              <Center>
                <Box 
                  bg="white" 
                  p="8" 
                  rounded="full" 
                  shadow="4"
                  borderWidth={3}
                  borderColor="green.200"
                >
                  <Icon 
                    as={MaterialIcons} 
                    name="admin-panel-settings" 
                    size="70" 
                    color="green.600" 
                  />
                </Box>
              </Center>

              {/* Title Section */}
              <VStack space="3" alignItems="center">
                <Heading size="xl" color="coolGray.800">
                  Masuk Bendahara
                </Heading>
                <Text 
                  fontSize="md" 
                  color="coolGray.600" 
                  textAlign="center"
                  px={4}
                >
                  Masuk sebagai Bendahara RT 01 RW 02
                </Text>
                <NBAlert 
                  status="success" 
                  colorScheme="success"
                  w="100%"
                  variant="subtle"
                  rounded="lg"
                >
                  <VStack space="2" flexShrink={1} w="100%">
                    <HStack flexShrink={1} space="2" alignItems="center">
                      <NBAlert.Icon />
                      <Text fontSize="sm" color="coolGray.800" flexShrink={1}>
                        Kelola data warga dan setoran jimpitan
                      </Text>
                    </HStack>
                  </VStack>
                </NBAlert>
              </VStack>

              {/* Form Section */}
              <VStack space="5">
                <Box>
                  <NBInput
                    label="Email"
                    placeholder="Masukkan email bendahara"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftElement={
                      <Icon 
                        as={MaterialIcons} 
                        name="email" 
                        size="5" 
                        ml="3" 
                        color="muted.400" 
                      />
                    }
                    focusBorderColor="green.500"
                  />
                </Box>

                <Box>
                  <NBInput
                    label="Password"
                    placeholder="Masukkan password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    leftElement={
                      <Icon 
                        as={MaterialIcons} 
                        name="lock" 
                        size="5" 
                        ml="3" 
                        color="muted.400" 
                      />
                    }
                    focusBorderColor="green.500"
                  />
                </Box>

                <NBButton
                  title={loading ? "Sedang Masuk..." : "Masuk"}
                  onPress={handleLogin}
                  disabled={loading}
                  isLoading={loading}
                  leftIcon={
                    <Icon 
                      as={MaterialIcons} 
                      name="login" 
                      size="sm" 
                      color="white"
                    />
                  }
                  size="lg"
                  bg="green.600"
                  _pressed={{
                    bg: "green.700"
                  }}
                  _hover={{
                    bg: "green.700"
                  }}
                  _text={{
                    fontSize: "md",
                    fontWeight: "semibold"
                  }}
                />
              </VStack>

              {/* Register Link */}
              <Center>
                <VStack space="2" alignItems="center">
                  <Text fontSize="sm" color="coolGray.600">
                    Belum memiliki akun bendahara?
                  </Text>
                  <Pressable onPress={() => router.push("/(auth)/bendahara-register")}>
                    <Text 
                      color="green.600" 
                      fontSize="sm" 
                      fontWeight="semibold"
                      underline
                    >
                      Daftar Sekarang
                    </Text>
                  </Pressable>
                </VStack>
              </Center>
            </VStack>

            {/* Footer */}
            <Center py="6">
              <Text fontSize="xs" color="coolGray.500">
                Sistem Pengelolaan Jimpitan Warga
              </Text>
            </Center>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
}