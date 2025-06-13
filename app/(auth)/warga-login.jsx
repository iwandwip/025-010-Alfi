import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SafeArea,
  VStack,
  HStack,
  CustomText as Text,
  Heading,
  Box,
  Center,
  Button,
  Input,
  Colors,
} from "../../components/ui/CoreComponents";
import { signInWithEmail } from "../../services/authService";

export default function WargaLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Mohon isi email dan password");
      return;
    }

    setLoading(true);
    const result = await signInWithEmail(email, password);

    if (result.success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Masuk Gagal", result.error);
    }
    setLoading(false);
  };

  return (
    <SafeArea style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <VStack style={styles.content}>
            {/* Header */}
            <HStack style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <HStack style={styles.backButton}>
                  <Text style={styles.backIcon}>←</Text>
                  <Text style={styles.backText}>Kembali</Text>
                </HStack>
              </TouchableOpacity>
            </HStack>

            {/* Content */}
            <VStack style={styles.mainContent}>
              {/* Logo/Illustration Area */}
              <Center style={styles.logoSection}>
                <Box style={styles.logoContainer}>
                  <Text style={styles.logoIcon}>💳</Text>
                </Box>
              </Center>

              {/* Title Section */}
              <VStack style={styles.titleSection}>
                <Heading size="xl" style={styles.title}>
                  Masuk Warga
                </Heading>
                <Text style={styles.subtitle}>
                  Masuk untuk memantau dan setor jimpitan
                </Text>
                <Box style={styles.infoBox}>
                  <HStack style={styles.infoContent}>
                    <Text style={styles.infoIcon}>ℹ️</Text>
                    <Text style={styles.infoText}>
                      Belum punya akun? Hubungi bendahara RT untuk pendaftaran
                    </Text>
                  </HStack>
                </Box>
              </VStack>

              {/* Form Section */}
              <VStack style={styles.formSection}>
                <Input
                  label="Email"
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Input
                  label="Password"
                  placeholder="Masukkan password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <Button
                  title={loading ? "Sedang Masuk..." : "Masuk"}
                  onPress={handleLogin}
                  disabled={loading}
                  loading={loading}
                  variant="primary"
                  size="lg"
                  style={styles.loginButton}
                />
              </VStack>
            </VStack>

            {/* Footer */}
            <Center style={styles.footer}>
              <Text style={styles.footerText}>
                Sistem Pengelolaan Jimpitan Warga
              </Text>
            </Center>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary + "10",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    paddingVertical: 16,
  },
  backButton: {
    alignItems: "center",
  },
  backIcon: {
    fontSize: 20,
    color: Colors.primary,
    marginRight: 4,
  },
  backText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "500",
  },

  // Main Content
  mainContent: {
    flex: 1,
    justifyContent: "center",
  },

  // Logo
  logoSection: {
    marginBottom: 32,
  },
  logoContainer: {
    backgroundColor: Colors.white,
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: Colors.primary + "30",
  },
  logoIcon: {
    fontSize: 40,
  },

  // Title
  titleSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    color: Colors.gray800,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  infoBox: {
    backgroundColor: Colors.blue + "10",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.blue + "30",
    width: "100%",
  },
  infoContent: {
    alignItems: "flex-start",
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: Colors.gray800,
    flex: 1,
    lineHeight: 20,
  },

  // Form
  formSection: {
    marginBottom: 32,
  },
  loginButton: {
    marginTop: 8,
  },

  // Footer
  footer: {
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: Colors.gray500,
  },
});
