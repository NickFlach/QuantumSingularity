import { Route, useLocation } from "wouter";
import { useAuth } from "./AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();

  return (
    <Route
      path={path}
      component={() => {
        if (loading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          navigate("/auth");
          return null;
        }

        return <Component />;
      }}
    />
  );
}