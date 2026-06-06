import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface PrivateRouteProps {
  children: ReactNode;
  role: "admin" | "employee";
}

export function PrivateRoute({ children, role }: PrivateRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setLocation("/login");
      } else if (user.role !== role) {
        setLocation(`/${user.role}/dashboard`);
      }
    }
  }, [user, loading, role, setLocation]);

  if (loading || !user || user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
