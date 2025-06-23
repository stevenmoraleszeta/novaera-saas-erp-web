// Hook personalizado de ejemplo para autenticación
import { useContext } from "react";
import { useAuth as useAuthProvider } from "../components/AuthProvider";

export function useAuth() {
  return useAuthProvider();
}
