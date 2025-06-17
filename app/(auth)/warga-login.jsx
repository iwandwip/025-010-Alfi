import React, { useState } from "react";
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { signInWithEmail } from "../../services/authService";
import Animated, { FadeInDown, FadeInUp, BounceIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function WargaLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
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
      router.replace("/(tabs)");
    } else {
      Alert.alert("Login Gagal", result.error);
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
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
            <TouchableOpacity
              onPress={() => router.push("/role-selection")}
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
          </Animated.View>

          {/* Illustration */}
          <Animated.View 
            entering={BounceIn.delay(200).springify()}
            style={styles.illustrationContainer}
          >
            <View style={[styles.illustrationSurface, Shadows.lg]}>
              <View style={[styles.avatarIcon, { backgroundColor: Colors.secondary + '20' }]}>
                <MaterialIcons 
                  name="home" 
                  size={50} 
                  color={Colors.secondary}
                />
              </View>
            </View>
          </Animated.View>

          {/* Welcome Text */}
          <Animated.View 
            entering={FadeInUp.delay(300)}
            style={styles.welcomeSection}
          >
            <Text style={[styles.welcomeTitle, { color: Colors.primary }]}>
              Selamat Datang
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: Colors.textSecondary }]}>
              Portal Warga RT 01 RW 02
            </Text>
          </Animated.View>

          {/* Banner Info */}
          {showBanner && (
            <Animated.View entering={FadeInUp.delay(400)}>
              <View style={styles.banner}>
                <View style={styles.bannerContent}>
                  <MaterialIcons name="info" size={20} color={Colors.info} />
                  <Text style={styles.bannerText}>
                    Belum punya akun? Hubungi bendahara RT untuk pendaftaran.
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowBanner(false)} style={styles.bannerAction}>
                  <Text style={styles.bannerActionText}>Mengerti</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Login Form */}
          <Animated.View entering={FadeInUp.delay(500)}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                Masuk Akun Warga
              </Text>

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Masukkan email Anda"
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                placeholder="Masukkan password Anda"
              />

              <Button
                variant="primary"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
              >
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </View>
          </Animated.View>

          {/* Features */}
          <Animated.View entering={FadeInUp.delay(600)} style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>
              Fitur untuk Warga:
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: Colors.success + '20' }]}>
                  <MaterialIcons 
                    name="credit-card" 
                    size={20} 
                    color={Colors.success}
                  />
                </View>
                <Text style={styles.featureText}>
                  Cek status setoran
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: Colors.info + '20' }]}>
                  <MaterialIcons 
                    name="history" 
                    size={20} 
                    color={Colors.info}
                  />
                </View>
                <Text style={styles.featureText}>
                  Riwayat pembayaran
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: Colors.warning + '20' }]}>
                  <MaterialIcons 
                    name="edit" 
                    size={20} 
                    color={Colors.warning}
                  />
                </View>
                <Text style={styles.featureText}>
                  Kelola profil
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeInUp.delay(700)} style={styles.footer}>
            <Text style={[styles.footerText, { color: Colors.textSecondary }]}>
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
    padding: 8,
    borderRadius: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  illustrationSurface: {
    padding: 20,
    borderRadius: 80,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  banner: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: Colors.info + '10',
    borderWidth: 1,
    borderColor: Colors.info + '40',
    padding: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  bannerAction: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.info,
  },
  bannerActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  formCard: {
    borderRadius: 16,
    marginBottom: 30,
    backgroundColor: Colors.surface,
    padding: 20,
    ...Shadows.md,
  },
  formTitle: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: Colors.text,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 24,
  },
  featuresSection: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
  },
});