import { Route, useLocation } from "wouter";
import { useAuth } from "./AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();

  // Use effect hook to handle navigation after rendering
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Render a component wrapper
  const ProtectedComponent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    // Only render the component if user exists
    if (user) {
      return <Component />;
    }

    // Return empty div while redirecting
    return <div className="hidden"></div>;
  };

  return <Route path={path} component={ProtectedComponent} />;
}