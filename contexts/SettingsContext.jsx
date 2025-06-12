import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    return {
      theme: "light",
      loading: false,
      changeTheme: () => {},
    };
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("app_theme");
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      setTheme("light");
    } finally {
      setLoading(false);
    }
  };

  const changeTheme = async (newTheme) => {
    try {
      if (newTheme === "light" || newTheme === "dark") {
        setTheme(newTheme);
        await AsyncStorage.setItem("app_theme", newTheme);
      }
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const value = {
    theme: theme || "light",
    loading,
    changeTheme,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
