"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { AuthContext, User } from "@/contexts/AuthContext";

// Credenciales hardcodeadas (temporal)
const HARDCODED_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

// TODO: Reemplazar con llamadas a API endpoints
// const API_ENDPOINTS = {
//   login: "/api/auth/login",
//   logout: "/api/auth/logout",
//   validateToken: "/api/auth/validate",
// };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay una sesión guardada al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // TODO: Reemplazar con llamada real a API
      // const response = await fetch(API_ENDPOINTS.login, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ username, password }),
      // });
      // const data = await response.json();
      
      // Simulación de autenticación con credenciales hardcodeadas
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simular latencia de red
      
      if (username === HARDCODED_CREDENTIALS.username && password === HARDCODED_CREDENTIALS.password) {
        const userData: User = {
          username,
          email: `${username}@example.com`,
        };
        
        setUser(userData);
        localStorage.setItem("auth_user", JSON.stringify(userData));
        setIsLoading(false);
        
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: "Credenciales inválidas" };
      }
    } catch {
      setIsLoading(false);
      return { success: false, error: "Error al iniciar sesión" };
    }
  };

  const logout = () => {
    // TODO: Llamar a API para invalidar token
    // fetch(API_ENDPOINTS.logout, { method: "POST" });
    
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
