"use client";

import { useEffect } from "react";
import useUserStore from "../../stores/userStore";
import { getUser } from "../../services/authService";

export default function UserInitializer() {
  const { user, setUser } = useUserStore();

  useEffect(() => {
    const initializeUser = async () => {
      // Only try to load user if store is empty
      if (!user) {
        try {
          const userData = await getUser();

          // Check if userData has the user property or if it's the user data directly
          if (userData && (userData.user || userData.id)) {
            const userToSet = userData.user || userData;
            setUser(userToSet);
          }
        } catch (error) {
          // Handle 401 errors silently (user not authenticated)
          if (error?.response?.status !== 401) {
            console.error("UserInitializer: Error loading user:", error.message);
          }
          // Don't throw error, just log it - user might not be authenticated
        }
      }
    };

    initializeUser();
  }, [user, setUser]);

  // This component doesn't render anything
  return null;
}
