// useAxiosAuth.js
import axios from "../lib/axios";
import { useMemo } from "react";
import useUserStore from "../stores/userStore";

export function useAxiosAuth() {
  const { user } = useUserStore();

  const instance = useMemo(() => {
    // The axios instance is already configured to use cookies
    // No need to manually add auth headers since we're using httpOnly cookies
    return axios;
  }, [user]); // Re-create instance when user changes

  return instance;
}
