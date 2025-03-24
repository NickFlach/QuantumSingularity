import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@shared/schema";
import { apiRequest } from "./queryClient";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await apiRequest<{ user: User }>("GET", "/api/auth/me");
        setUser(response.user);
      } catch (error) {
        // Not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiRequest<{ user: User }>("POST", "/api/auth/login", {
        username,
        password,
      });
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/register", {
        username,
        password,
      });
      // Automatically log in after registration
      await login(username, password);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// HOC to protect routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  const WithAuth: React.FC<P> = (props) => {
    const { user, loading } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

    if (loading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
      // Import and render auth forms
      const AuthForms = React.lazy(() => import("@/components/AuthForms").then(module => {
        return { default: module.AuthForms };
      }));

      return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 p-4">
          <React.Suspense fallback={<div>Loading...</div>}>
            <AuthForms onSuccess={() => setShowAuthModal(false)} />
          </React.Suspense>
        </div>
      );
    }

    return <Component {...props} />;
  };

  return WithAuth;
}