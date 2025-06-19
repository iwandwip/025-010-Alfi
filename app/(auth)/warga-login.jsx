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
});