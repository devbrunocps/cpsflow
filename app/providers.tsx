"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider } from "./theme-provider";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface CompanyContextType {
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const CompanyContext = createContext<CompanyContextType | undefined>(
  undefined
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthContextType>({
    user: null,
    isLoading: true,
    error: null,
  });

  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

  useEffect(() => {
    // Get user from localStorage or fetch from API
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setAuthState({
            user: data.user,
            isLoading: false,
            error: null,
          });
          // Restore company selection from localStorage
          const savedCompanyId = localStorage.getItem("activeCompanyId");
          if (savedCompanyId) {
            setActiveCompanyId(savedCompanyId);
          }
        } else {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        setAuthState({
          user: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Erro ao verificar autenticação",
        });
      }
    };

    checkAuth();
  }, []);

  const handleSetActiveCompanyId = (id: string) => {
    setActiveCompanyId(id);
    localStorage.setItem("activeCompanyId", id);
  };

  return (
    <ThemeProvider>
      <AuthContext.Provider value={authState}>
        <CompanyContext.Provider
          value={{
            activeCompanyId,
            setActiveCompanyId: handleSetActiveCompanyId,
          }}
        >
          {children}
        </CompanyContext.Provider>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within Providers");
  }
  return context;
}

export function useCompanyContext() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompanyContext must be used within Providers");
  }
  return context;
}
