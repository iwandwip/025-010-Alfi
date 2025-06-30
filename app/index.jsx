import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Colors } from "../constants/Colors";

export default function Index() {
  const { currentUser, loading, authInitialized, userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authInitialized && !loading) {
      if (currentUser && userProfile) {
        if (userProfile.role === "admin") {
          router.replace("/(admin)");
        } else if (userProfile.role === "user") {
          router.replace("/(tabs)");
        } else {
          router.replace("/role-selection");
        }
      } else {
        router.replace("/role-selection");
      }
    }
  }, [currentUser, loading, authInitialized, userProfile]);

  if (!authInitialized || loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner text="Memuat..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LoadingSpinner text="Mengarahkan..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
});
