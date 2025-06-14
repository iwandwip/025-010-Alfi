import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { SettingsProvider, useSettings } from "../contexts/SettingsContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import ErrorBoundary from "../components/ErrorBoundary";
import ToastNotification from "../components/ui/ToastNotification";
import { lightTheme, darkTheme } from "../constants/PaperTheme";

function AppContent() {
  const { user } = useAuth();
  const { theme } = useSettings();
  const paperTheme = theme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <PaperProvider theme={paperTheme}>
      <NotificationProvider>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(admin)" />
        </Stack>
        <ToastNotification />
      </NotificationProvider>
    </PaperProvider>
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
