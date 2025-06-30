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

  const checkAdminStatus = (user, profile) => {
    return (
      user?.email === "admin@gmail.com" ||
      profile?.role === "admin" ||
      profile?.isAdmin
    );
  };

  const loadUserProfile = async (user, retryCount = 0) => {
    if (!user) {
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }

    try {
      const result = await getUserProfile(user.uid);
      if (result.success) {
        const adminStatus = checkAdminStatus(user, result.profile);
        setIsAdmin(adminStatus);
        setUserProfile(result.profile);
        console.log("User profile loaded successfully");

        if (!adminStatus && result.profile.role === "user") {
          try {
            await paymentStatusManager.handleUserLogin(user.uid);
          } catch (error) {
            console.warn("Error during payment status update on login:", error);
          }
        } else if (adminStatus) {
          try {
            await paymentStatusManager.handleUserLogin(null);
          } catch (error) {
            console.warn(
              "Error during admin payment status update on login:",
              error
            );
          }
        }
      } else {
        const adminStatus = checkAdminStatus(user, null);
        setIsAdmin(adminStatus);

        if (adminStatus) {
          setUserProfile({
            id: user.uid,
            email: user.email,
            name: "Admin",
            role: "admin",
            isAdmin: true,
          });

          try {
            await paymentStatusManager.handleUserLogin(null);
          } catch (error) {
            console.warn(
              "Error during admin payment status update on login:",
              error
            );
          }
        } else {
          console.warn("Failed to load user profile:", result.error);
          
          // Retry once after 2 seconds if first attempt fails
          if (retryCount === 0) {
            console.log("Retrying profile load in 2 seconds...");
            setTimeout(() => loadUserProfile(user, 1), 2000);
          } else {
            setUserProfile(null);
          }
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      const adminStatus = checkAdminStatus(user, null);
      setIsAdmin(adminStatus);

      if (adminStatus) {
        setUserProfile({
          id: user.uid,
          email: user.email,
          name: "Admin",
          role: "admin",
          isAdmin: true,
        });
      } else {
        // Retry once if network error
        if (retryCount === 0) {
          console.log("Retrying profile load due to error...");
          setTimeout(() => loadUserProfile(user, 1), 2000);
        } else {
          setUserProfile(null);
        }
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

    const initializeAuth = async () => {
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
        // Check if user is already signed in
        const currentUser = auth.currentUser;
        if (currentUser && mounted) {
          console.log("Found existing authenticated user:", currentUser.email);
          setCurrentUser(currentUser);
          await loadUserProfile(currentUser);
          setLoading(false);
          setAuthInitialized(true);
        }

        unsubscribe = onAuthStateChanged(
          auth,
          async (user) => {
            if (mounted) {
              console.log(
                "Auth state changed:",
                user ? `User logged in: ${user.email}` : "User logged out"
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
              // Don't clear user on error, just mark as initialized
              setLoading(false);
              setAuthInitialized(true);
            }
          }
        );
      } catch (error) {
        console.error("Failed to initialize auth listener:", error);
        if (mounted) {
          // Don't clear user on initialization error
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (mounted && loading && !authInitialized) {
        console.warn("Auth initialization timeout, proceeding anyway");
        // Don't clear user on timeout, just mark as initialized
        setLoading(false);
        setAuthInitialized(true);
      }
    }, 10000); // Increase timeout to 10 seconds

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
