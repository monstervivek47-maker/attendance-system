import { useState, useEffect, useCallback } from "react";
import { getCurrentUser, setCurrentUser, clearCurrentUser, UserSession } from "@/utils/storage";

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const login = useCallback((sessionData: UserSession) => {
    setCurrentUser(sessionData);
    setUser(sessionData);
  }, []);

  const logout = useCallback(() => {
    clearCurrentUser();
    setUser(null);
  }, []);

  return {
    user,
    login,
    logout,
    loading
  };
}
