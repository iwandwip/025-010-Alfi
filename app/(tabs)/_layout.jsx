import React from "react";
import { Alert } from "react-native";
import {
  Surface,
  Text,
  ActivityIndicator,
  useTheme,
  MD3Colors
} from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from "expo-router";
import { useSettings } from "../../contexts/SettingsContext";
import { signOutUser } from "../../services/authService";

export default function TabsLayout() {
  const { theme, loading } = useSettings();
  const paperTheme = useTheme();
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
      <Surface
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" animating />
        <Text variant="bodyLarge" style={{ marginTop: 16 }}>
          Memuat...
        </Text>
      </Surface>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: paperTheme.colors.primary,
        tabBarInactiveTintColor: paperTheme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: paperTheme.colors.surface,
          borderTopColor: paperTheme.colors.outline,
          elevation: 8,
          shadowColor: paperTheme.colors.shadow,
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
