import { use } from "react";
import { AuthContext } from "../contexts/AuthContext";

export function useAuth() {
  const context = use(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return context;
}
