import { useContext } from "react";
import { MCPContext } from "@/contexts/MCPContext";

export const useMCP = () => {
  const context = useContext(MCPContext);
  if (!context) {
    throw new Error("useMCP must be used within MCPProvider");
  }
  return {
    mcpSelection: context.mcpSelection,
    setMCPSelection: context.setMCPSelection,
  };
};
