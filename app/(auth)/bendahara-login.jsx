import React, { useState } from "react";
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { 
  Surface, 
  Text, 
  TextInput, 
  Button, 
  IconButton,
  useTheme,
  ActivityIndicator,
  Avatar,
  Chip,
  Card,
  Divider
} from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { signInWithEmail } from "../../services/authService";
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function BendaharaLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      router.replace("/(admin)");
    } else {
      Alert.alert("Login Gagal", result.error);
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={[theme.colors.primaryContainer, theme.colors.surface]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <IconButton
              icon="arrow-left"
              size={28}
              onPress={() => router.back()}
              style={styles.backButton}
              iconColor={theme.colors.primary}
            />
          </Animated.View>

          {/* Logo Section */}
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            style={styles.logoSection}
          >
            <Surface style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]} elevation={5}>
              <Avatar.Icon 
                size={80} 
                icon="account-tie" 
                style={{ backgroundColor: 'transparent' }}
                color={theme.colors.onPrimary}
              />
            </Surface>
            
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              Portal Bendahara
            </Text>
            
            <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Sistem Pengelolaan Jimpitan RT
            </Text>

            <View style={styles.chipContainer}>
              <Chip 
                icon="shield-check" 
                mode="flat"
                style={{ backgroundColor: theme.colors.tertiaryContainer }}
                textStyle={{ color: theme.colors.onTertiaryContainer }}
              >
                Akses Khusus Bendahara
              </Chip>
            </View>
          </Animated.View>

          {/* Login Form */}
          <Animated.View entering={FadeInUp.delay(300).springify()}>
            <Card style={styles.formCard} mode="elevated">
              <Card.Content>
                <Text variant="titleLarge" style={styles.formTitle}>
                  Masuk ke Akun Anda
                </Text>

                <TextInput
                  label="Email Bendahara"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email" />}
                  style={styles.input}
                  outlineStyle={{ borderRadius: 16 }}
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon 
                      icon={showPassword ? "eye-off" : "eye"} 
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={styles.input}
                  outlineStyle={{ borderRadius: 16 }}
                />

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.loginButton}
                  contentStyle={styles.loginButtonContent}
                  labelStyle={styles.loginButtonLabel}
                  icon="login"
                >
                  {loading ? "Memproses..." : "Masuk"}
                </Button>

                <Divider style={styles.divider} />

                <View style={styles.infoSection}>
                  <Surface style={styles.infoCard} elevation={0}>
                    <Avatar.Icon 
                      size={40} 
                      icon="information" 
                      style={{ backgroundColor: theme.colors.infoContainer }}
                      color={theme.colors.onInfoContainer}
                    />
                    <View style={styles.infoTextContainer}>
                      <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
                        Fitur Bendahara
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        • Kelola data warga & RFID{'\n'}
                        • Catat setoran jimpitan{'\n'}
                        • Laporan keuangan RT
                      </Text>
                    </View>
                  </Surface>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>

          {/* Register Link */}
          <Animated.View 
            entering={FadeInUp.delay(400).springify()}
            style={styles.registerSection}
          >
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Belum punya akun bendahara?
            </Text>
            <Button
              mode="text"
              onPress={() => router.push("/(auth)/bendahara-register")}
              style={styles.registerButton}
              labelStyle={{ color: theme.colors.primary }}
            >
              Daftar Sekarang
            </Button>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -8,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  chipContainer: {
    marginTop: 8,
  },
  formCard: {
    borderRadius: 24,
    marginBottom: 24,
  },
  formTitle: {
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 28,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 24,
  },
  infoSection: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  registerSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  registerButton: {
    marginTop: 4,
  },
});