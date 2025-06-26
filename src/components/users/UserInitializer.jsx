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
          console.log(
            "🔄 UserInitializer: No user in store, checking server..."
          );
          const userData = await getUser();
          console.log("🔄 UserInitializer: Server response:", userData);

          // Check if userData has the user property or if it's the user data directly
          if (userData && (userData.user || userData.id)) {
            const userToSet = userData.user || userData;
            console.log(
              "✅ UserInitializer: User loaded from server:",
              userToSet
            );
            setUser(userToSet);
          } else {
            console.log("❌ UserInitializer: No user data from server");
          }
        } catch (error) {
          // Handle 401 errors silently (user not authenticated)
          if (error?.response?.status === 401) {
            console.log("ℹ️ UserInitializer: User not authenticated (401)");
          } else {
            console.log(
              "❌ UserInitializer: Error loading user:",
              error.message
            );
          }
          // Don't throw error, just log it - user might not be authenticated
        }
      } else {
        console.log("✅ UserInitializer: User already in store:", user);
      }
    };

    initializeUser();
  }, [user, setUser]);

  // This component doesn't render anything
  return null;
}
