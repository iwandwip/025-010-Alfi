import React, { createContext, useContext } from "react";
import { getThemeByRole } from "../constants/Colors";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { isAdmin } = useAuth();
  const theme = getThemeByRole(isAdmin);

  const value = {
    theme,
    isAdmin,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};