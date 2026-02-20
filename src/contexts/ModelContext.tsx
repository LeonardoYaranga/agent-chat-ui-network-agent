"use client";

import React, {
  createContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { LLMConfig, ModelInfo, DEFAULT_MODEL } from "@/lib/models";

export interface ModelContextType {
  selectedModel: ModelInfo;
  llmConfig: LLMConfig;
  setModel: (config: LLMConfig, model: ModelInfo) => void;
}

export const ModelContext = createContext<ModelContextType | undefined>(
  undefined,
);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<ModelInfo>(DEFAULT_MODEL);
  const [llmConfig, setLLMConfig] = useState<LLMConfig>({
    provider: DEFAULT_MODEL.provider,
    model: DEFAULT_MODEL.model,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar desde localStorage al iniciar - solo una vez
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isInitialized) return; // Prevenir re-inicializaciones

    const saved = localStorage.getItem("lg:selectedModel");
    if (saved) {
      try {
        const { config, model } = JSON.parse(saved);
        setLLMConfig(config);
        setSelectedModel(model);
      } catch (e) {
        console.error("Error loading saved model:", e);
      }
    }
    setIsInitialized(true);
  }, [isInitialized]);

  const setModel = useCallback((config: LLMConfig, model: ModelInfo) => {
    setLLMConfig(config);
    setSelectedModel(model);

    // Guardar en localStorage para persistencia
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "lg:selectedModel",
        JSON.stringify({ config, model }),
      );
    }
  }, []);

  return (
    <ModelContext.Provider value={{ selectedModel, llmConfig, setModel }}>
      {children}
    </ModelContext.Provider>
  );
}
