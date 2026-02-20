"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline">{user.username}</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Cuenta de Usuario</SheetTitle>
          <SheetDescription>
            Información de tu cuenta y opciones
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Usuario
            </p>
            <p className="text-lg font-semibold">{user.username}</p>
          </div>
          
          {user.email && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-lg">{user.email}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              className="w-full"
              onClick={logout}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
