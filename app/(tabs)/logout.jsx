import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function LogoutScreen() {
  const router = useRouter();

  useEffect(() => {
    // This screen should never actually render since we handle logout in the tab press
    // But if it does, redirect back to profile
    router.replace("/(tabs)/profile");
  }, []);

  return null;
}