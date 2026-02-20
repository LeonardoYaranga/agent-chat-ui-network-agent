import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AuthProvider } from "@/providers/Auth";
import { ModelProvider } from "@/contexts/ModelContext";
import { MCPProvider } from "@/contexts/MCPContext";

const inter = Inter({
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agent Chat",
  description: "Agent Chat UX by LangChain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ModelProvider>
            <MCPProvider>
              <NuqsAdapter>{children}</NuqsAdapter>
            </MCPProvider>
          </ModelProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
