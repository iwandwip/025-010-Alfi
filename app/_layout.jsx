import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import ErrorBoundary from "../components/ErrorBoundary";
import ToastNotification from "../components/ui/ToastNotification";

function AppContent() {
  const { user } = useAuth();
  
  return (
    <NotificationProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(admin)" />
      </Stack>
      <ToastNotification />
    </NotificationProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
