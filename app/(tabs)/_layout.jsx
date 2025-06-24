import React from "react";
import { Alert, View, Text, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from "expo-router";
import { useSettings } from "../../contexts/SettingsContext";
import { signOutUser } from "../../services/authService";
import { useRoleTheme } from '../../hooks/useRoleTheme';

export default function TabsLayout() {
  const { theme, loading } = useSettings();
  const { colors } = useRoleTheme();
  // Using custom theme from constants
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Keluar",
      "Apakah Anda yakin ingin keluar?",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            const result = await signOutUser();
            if (result.success) {
              router.replace("/(auth)/warga-login");
            } else {
              Alert.alert("Error", result.error || "Gagal keluar");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, fontSize: 16, color: colors.text }}>
          Memuat...
        </Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Status Pembayaran",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="credit-card-check" 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="account" 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          title: "Keluar",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="logout" 
              size={size} 
              color={color} 
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleLogout();
          },
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
