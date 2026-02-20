"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";

export interface MCPSelection {
  enabledServers?: string[];
  allowedToolsByServer?: Record<string, string[]>;
}

interface MCPContextType {
  mcpSelection: MCPSelection;
  setMCPSelection: (selection: MCPSelection) => void;
}

export const MCPContext = createContext<MCPContextType | undefined>(undefined);

const STORAGE_KEY = "mcp-selection";

const DEFAULT_SELECTION: MCPSelection = {
  enabledServers: ["networkAutomation", "netCommand"],
  allowedToolsByServer: {
    networkAutomation: ["generate_router_cisco_config"],
    netCommand: [
      "execute_ssh_command",
      "execute_telnet_command",
      "list_eve_labs",
      "list_active_nodes",
    ],
  },
};

export const MCPProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Cargar desde localStorage si existe, sino usar default (sin GitHub)
  const [mcpSelection, setMCPSelectionState] = useState<MCPSelection>(() => {
    if (typeof window === "undefined") return DEFAULT_SELECTION;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SELECTION;
    } catch (error) {
      console.error("Error loading MCP selection from localStorage:", error);
      return DEFAULT_SELECTION;
    }
  });

  // Wrapper para persistir en localStorage cuando cambie
  const setMCPSelection = (selection: MCPSelection) => {
    setMCPSelectionState(selection);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } catch (error) {
      console.error("Error saving MCP selection to localStorage:", error);
    }
  };

  return (
    <MCPContext.Provider value={{ mcpSelection, setMCPSelection }}>
      {children}
    </MCPContext.Provider>
  );
};
