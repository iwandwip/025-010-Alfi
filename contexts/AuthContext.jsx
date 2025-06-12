import React, { createContext, useState, useContext, useEffect } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from "../services/userService";
import { paymentStatusManager } from "../services/paymentStatusManager";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      currentUser: null,
      userProfile: null,
      loading: false,
      authInitialized: true,
      isAdmin: false,
      refreshProfile: () => {},
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkBendaharaStatus = (user, profile) => {
    return (
      user?.email === "bendahara@gmail.com" ||
      profile?.role === "bendahara" ||
      profile?.role === "admin" ||
      profile?.isAdmin
    );
  };

  const loadUserProfile = async (user) => {
    if (!user) {
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }

    try {
      const result = await getUserProfile(user.uid);
      if (result.success) {
        const bendaharaStatus = checkBendaharaStatus(user, result.profile);
        setIsAdmin(bendaharaStatus);
        setUserProfile(result.profile);

        if (!bendaharaStatus && result.profile.role === "user") {
          try {
            await paymentStatusManager.handleUserLogin(user.uid);
          } catch (error) {
            console.warn("Error during payment status update on login:", error);
          }
        } else if (bendaharaStatus) {
          try {
            await paymentStatusManager.handleUserLogin(null);
          } catch (error) {
            console.warn(
              "Error during bendahara payment status update on login:",
              error
            );
          }
        }
      } else {
        const bendaharaStatus = checkBendaharaStatus(user, null);
        setIsAdmin(bendaharaStatus);

        if (bendaharaStatus) {
          setUserProfile({
            id: user.uid,
            email: user.email,
            name: "Admin",
            role: "bendahara",
            isAdmin: true,
          });

          try {
            await paymentStatusManager.handleUserLogin(null);
          } catch (error) {
            console.warn(
              "Error during bendahara payment status update on login:",
              error
            );
          }
        } else {
          console.warn("Failed to load user profile:", result.error);
          setUserProfile(null);
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      const bendaharaStatus = checkBendaharaStatus(user, null);
      setIsAdmin(bendaharaStatus);

      if (bendaharaStatus) {
        setUserProfile({
          id: user.uid,
          email: user.email,
          name: "Admin",
          role: "admin",
          isAdmin: true,
        });
      } else {
        setUserProfile(null);
      }
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await loadUserProfile(currentUser);
    }
  };

  useEffect(() => {
    let unsubscribe = null;
    let mounted = true;

    const initializeAuth = () => {
      if (!auth) {
        console.warn("Firebase Auth not available, using fallback");
        if (mounted) {
          setCurrentUser(null);
          setUserProfile(null);
          setLoading(false);
          setAuthInitialized(true);
          setIsAdmin(false);
        }
        return;
      }

      try {
        unsubscribe = onAuthStateChanged(
          auth,
          async (user) => {
            if (mounted) {
              console.log(
                "Auth state changed:",
                user ? "User logged in" : "User logged out"
              );
              setCurrentUser(user);
              await loadUserProfile(user);
              setLoading(false);
              setAuthInitialized(true);
            }
          },
          (error) => {
            console.error("Auth state change error:", error);
            if (mounted) {
              setCurrentUser(null);
              setUserProfile(null);
              setLoading(false);
              setAuthInitialized(true);
              setIsAdmin(false);
            }
          }
        );
      } catch (error) {
        console.error("Failed to initialize auth listener:", error);
        if (mounted) {
          setCurrentUser(null);
          setUserProfile(null);
          setLoading(false);
          setAuthInitialized(true);
          setIsAdmin(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (mounted && loading && !authInitialized) {
        console.warn("Auth initialization timeout, proceeding anyway");
        setCurrentUser(null);
        setUserProfile(null);
        setLoading(false);
        setAuthInitialized(true);
        setIsAdmin(false);
      }
    }, 5000);

    initializeAuth();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
      clearTimeout(timeoutId);
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    authInitialized,
    isAdmin,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
