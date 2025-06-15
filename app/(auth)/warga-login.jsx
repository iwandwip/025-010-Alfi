import React, { useState } from "react";
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { 
  Surface, 
  Text, 
  TextInput, 
  Button, 
  IconButton,
  useTheme,
  Avatar,
  Card,
  Banner
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { signInWithEmail } from "../../services/authService";
import Animated, { FadeInDown, FadeInUp, BounceIn } from 'react-native-reanimated';

export default function WargaLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

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
      Alert.alert("Login Gagal", result.error);
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => router.push("/role-selection")}
              style={styles.backButton}
            />
          </Animated.View>

          {/* Illustration */}
          <Animated.View 
            entering={BounceIn.delay(200).springify()}
            style={styles.illustrationContainer}
          >
            <Surface style={styles.illustrationSurface} elevation={3}>
              <Avatar.Icon 
                size={100} 
                icon="home-city" 
                style={{ backgroundColor: theme.colors.secondaryContainer }}
                color={theme.colors.onSecondaryContainer}
              />
            </Surface>
          </Animated.View>

          {/* Welcome Text */}
          <Animated.View 
            entering={FadeInUp.delay(300)}
            style={styles.welcomeSection}
          >
            <Text variant="displaySmall" style={[styles.welcomeTitle, { color: theme.colors.primary }]}>
              Selamat Datang
            </Text>
            <Text variant="titleMedium" style={[styles.welcomeSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Portal Warga RT 01 RW 02
            </Text>
          </Animated.View>

          {/* Banner Info */}
          {showBanner && (
            <Animated.View entering={FadeInUp.delay(400)}>
              <Banner
                visible={showBanner}
                actions={[
                  {
                    label: 'Mengerti',
                    onPress: () => setShowBanner(false),
                  },
                ]}
                icon="information"
                style={styles.banner}
              >
                Belum punya akun? Hubungi bendahara RT untuk pendaftaran.
              </Banner>
            </Animated.View>
          )}

          {/* Login Form */}
          <Animated.View entering={FadeInUp.delay(500)}>
            <Card style={styles.formCard} mode="outlined">
              <Card.Content>
                <Text variant="titleLarge" style={styles.formTitle}>
                  Masuk Akun Warga
                </Text>

                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email-outline" />}
                  style={styles.input}
                  outlineStyle={{ borderRadius: 12 }}
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  left={<TextInput.Icon icon="lock-outline" />}
                  right={
                    <TextInput.Icon 
                      icon={showPassword ? "eye-off" : "eye"} 
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={styles.input}
                  outlineStyle={{ borderRadius: 12 }}
                />

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.loginButton}
                  contentStyle={styles.loginButtonContent}
                  icon="login-variant"
                >
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </Card.Content>
            </Card>
          </Animated.View>

          {/* Features */}
          <Animated.View entering={FadeInUp.delay(600)} style={styles.featuresSection}>
            <Text variant="titleMedium" style={styles.featuresTitle}>
              Fitur untuk Warga:
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Avatar.Icon 
                  size={36} 
                  icon="credit-card-check" 
                  style={{ backgroundColor: theme.colors.successContainer }}
                  color={theme.colors.onSuccessContainer}
                />
                <Text variant="bodyMedium" style={styles.featureText}>
                  Cek status setoran
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Avatar.Icon 
                  size={36} 
                  icon="history" 
                  style={{ backgroundColor: theme.colors.infoContainer }}
                  color={theme.colors.onInfoContainer}
                />
                <Text variant="bodyMedium" style={styles.featureText}>
                  Riwayat pembayaran
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Avatar.Icon 
                  size={36} 
                  icon="account-edit" 
                  style={{ backgroundColor: theme.colors.warningContainer }}
                  color={theme.colors.onWarningContainer}
                />
                <Text variant="bodyMedium" style={styles.featureText}>
                  Kelola profil
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeInUp.delay(700)} style={styles.footer}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              © 2024 Sistem Jimpitan Warga
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -8,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  illustrationSurface: {
    padding: 20,
    borderRadius: 80,
    backgroundColor: 'transparent',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    opacity: 0.8,
  },
  banner: {
    marginBottom: 20,
    borderRadius: 12,
  },
  formCard: {
    borderRadius: 16,
    marginBottom: 30,
  },
  formTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 24,
  },
  loginButtonContent: {
    paddingVertical: 6,
  },
  featuresSection: {
    marginBottom: 30,
  },
  featuresTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});