import { useContext } from "react";
import { ModelContext } from "@/contexts/ModelContext";
import type { ModelContextType } from "@/contexts/ModelContext";

export function useModel(): ModelContextType {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
}
