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
  Divider,
} from "native-base";
import { Platform, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NBInput from "../../components/ui/NBInput";
import NBButton from "../../components/ui/NBButton";
import { signUpWithEmail } from "../../services/authService";

export default function BendaharaRegister() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nama: "",
    noHp: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert("Error", "Email wajib diisi");
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert("Error", "Password wajib diisi");
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Konfirmasi password tidak cocok");
      return false;
    }
    if (!formData.nama.trim()) {
      Alert.alert("Error", "Nama wajib diisi");
      return false;
    }
    if (!formData.noHp.trim()) {
      Alert.alert("Error", "No HP wajib diisi");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const profileData = {
      nama: formData.nama,
      noHp: formData.noHp,
      role: "bendahara",
    };

    const result = await signUpWithEmail(
      formData.email,
      formData.password,
      profileData
    );

    if (result.success) {
      Alert.alert("Berhasil", "Akun bendahara berhasil dibuat!", [
        { text: "OK", onPress: () => router.replace("/(admin)") },
      ]);
    } else {
      Alert.alert("Pendaftaran Gagal", result.error);
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
            <VStack flex="1" space="6" pb="6">
              {/* Logo/Illustration Area */}
              <Center>
                <Box 
                  bg="white" 
                  p="6" 
                  rounded="full" 
                  shadow="4"
                  borderWidth="3"
                  borderColor="green.200"
                >
                  <Icon 
                    as={MaterialIcons} 
                    name="person-add" 
                    size="50" 
                    color="green.600" 
                  />
                </Box>
              </Center>

              {/* Title Section */}
              <VStack space="3" alignItems="center">
                <Heading size="lg" color="coolGray.800">
                  Daftar Bendahara
                </Heading>
                <Text 
                  fontSize="md" 
                  color="coolGray.600" 
                  textAlign="center"
                  px={4}
                >
                  Buat akun Bendahara RT 01 RW 02
                </Text>
              </VStack>

              {/* Form Section */}
              <VStack space="4">
                {/* Account Info Section */}
                <VStack space="4">
                  <HStack alignItems="center" space="2" px={1}>
                    <Icon 
                      as={MaterialIcons} 
                      name="account-circle" 
                      size="sm" 
                      color="green.600" 
                    />
                    <Text fontSize="md" fontWeight="semibold" color="coolGray.700">
                      Informasi Akun
                    </Text>
                  </HStack>
                  
                  <Box>
                    <NBInput
                      label="Email"
                      placeholder="Masukkan email bendahara"
                      value={formData.email}
                      onChangeText={(value) => updateForm("email", value)}
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
                      placeholder="Masukkan password (min. 6 karakter)"
                      value={formData.password}
                      onChangeText={(value) => updateForm("password", value)}
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

                  <Box>
                    <NBInput
                      label="Konfirmasi Password"
                      placeholder="Ulangi password"
                      value={formData.confirmPassword}
                      onChangeText={(value) => updateForm("confirmPassword", value)}
                      secureTextEntry
                      leftElement={
                        <Icon 
                          as={MaterialIcons} 
                          name="lock-outline" 
                          size="5" 
                          ml="3" 
                          color="muted.400" 
                        />
                      }
                      focusBorderColor="green.500"
                    />
                  </Box>
                </VStack>

                <Divider my="2" />

                {/* Personal Info Section */}
                <VStack space="4">
                  <HStack alignItems="center" space="2" px={1}>
                    <Icon 
                      as={MaterialIcons} 
                      name="person" 
                      size="sm" 
                      color="green.600" 
                    />
                    <Text fontSize="md" fontWeight="semibold" color="coolGray.700">
                      Informasi Pribadi
                    </Text>
                  </HStack>

                  <Box>
                    <NBInput
                      label="Nama Lengkap"
                      placeholder="Masukkan nama lengkap"
                      value={formData.nama}
                      onChangeText={(value) => updateForm("nama", value)}
                      autoCapitalize="words"
                      leftElement={
                        <Icon 
                          as={MaterialIcons} 
                          name="badge" 
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
                      label="No HP"
                      placeholder="Masukkan nomor HP"
                      value={formData.noHp}
                      onChangeText={(value) => updateForm("noHp", value)}
                      keyboardType="phone-pad"
                      leftElement={
                        <Icon 
                          as={MaterialIcons} 
                          name="phone" 
                          size="5" 
                          ml="3" 
                          color="muted.400" 
                        />
                      }
                      focusBorderColor="green.500"
                    />
                  </Box>
                </VStack>

                <NBButton
                  title={loading ? "Sedang Mendaftar..." : "Daftar"}
                  onPress={handleRegister}
                  disabled={loading}
                  isLoading={loading}
                  leftIcon={
                    <Icon 
                      as={MaterialIcons} 
                      name="person-add" 
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
                  mt="2"
                />
              </VStack>

              {/* Login Link */}
              <Center>
                <VStack space="2" alignItems="center">
                  <Text fontSize="sm" color="coolGray.600">
                    Sudah memiliki akun bendahara?
                  </Text>
                  <Pressable onPress={() => router.push("/(auth)/bendahara-login")}>
                    <Text 
                      color="green.600" 
                      fontSize="sm" 
                      fontWeight="semibold"
                      underline
                    >
                      Masuk Sekarang
                    </Text>
                  </Pressable>
                </VStack>
              </Center>
            </VStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
}