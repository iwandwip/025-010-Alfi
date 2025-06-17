import React, { useState } from "react";
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
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
  // Using custom theme from constants

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
      colors={[Colors.primaryContainer, Colors.surface]}
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
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={28} color={Colors.primary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Logo Section */}
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            style={styles.logoSection}
          >
            <View style={[styles.logoContainer, { backgroundColor: Colors.primary }, Shadows.md]}>
              <MaterialIcons name="business-center" size={80} color={Colors.onPrimary} />
            </View>
            
            <Text style="headlineMedium" style={[styles.title, { color: Colors.onView }]}>
              Portal Bendahara
            </Text>
            
            <Text style="bodyLarge" style={[styles.subtitle, { color: Colors.onViewVariant }]}>
              Sistem Pengelolaan Jimpitan RT
            </Text>

            <View style={styles.chipContainer}>
              <View style={[styles.accessChip, { backgroundColor: Colors.tertiaryContainer }]}>
                <MaterialIcons name="verified-user" size={16} color={Colors.onTertiaryContainer} />
                <Text style={[styles.chipText, { color: Colors.onTertiaryContainer }]}>
                  Akses Khusus Bendahara
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Login Form */}
          <Animated.View entering={FadeInUp.delay(300).springify()}>
            <View style={[styles.formCard, Shadows.md, { backgroundColor: Colors.surface }]}>
              <View style={{ padding: 20 }}>
                <Text style="titleLarge" style={styles.formTitle}>
                  Masuk ke Akun Anda
                </Text>

                <Input
                  label="Email Bendahara"
                  value={email}
                  onChangeText={setEmail}
                                    keyboardType="email-address"
                  autoCapitalize="none"
                  left={<Input.Icon icon="email" />}
                  style={styles.input}
                  outlineStyle={{ borderRadius: 16 }}
                />

                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                  left={<Input.Icon icon="lock" />}
                  right={
                    <Input.Icon 
                      icon={showPassword ? "eye-off" : "eye"} 
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={styles.input}
                  outlineStyle={{ borderRadius: 16 }}
                />

                <Button
                  variant="primary"
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

                <View style={styles.divider} />

                <View style={styles.infoSection}>
                  <View style={[styles.infoCard, Shadows.md]}>
                    <View style={[styles.infoIcon, { backgroundColor: Colors.infoContainer }]}>
                      <MaterialIcons name="info" size={24} color={Colors.onInfoContainer} />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style="labelLarge" style={{ color: Colors.onView }}>
                        Fitur Bendahara
                      </Text>
                      <Text style="bodySmall" style={{ color: Colors.onViewVariant }}>
                        • Kelola data warga & RFID{'\n'}
                        • Catat setoran jimpitan{'\n'}
                        • Laporan keuangan RT
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Register Link */}
          <Animated.View 
            entering={FadeInUp.delay(400).springify()}
            style={styles.registerSection}
          >
            <Text style="bodyMedium" style={{ color: Colors.onViewVariant }}>
              Belum punya akun bendahara?
            </Text>
            <Button
              variant="outline"
              onPress={() => router.push("/(auth)/bendahara-register")}
              style={styles.registerButton}
              labelStyle={{ color: Colors.primary }}
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
  accessChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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