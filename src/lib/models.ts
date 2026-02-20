/**
 * @fileoverview Configuración de modelos LLM para el frontend
 *
 * Definiciones de tipos y modelos disponibles que pueden ser seleccionados
 * dinámicamente. Estos modelos se pasan al backend via runtime config.
 */

export type LLMProvider = "openai" | "openrouter" | "gemini" | "lmstudio";

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature?: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: LLMProvider;
  model: string;
  description: string;
  capabilities: {
    thinking?: boolean;
    streaming: boolean;
    tools: boolean;
    reasoning?: boolean;
    agents?: boolean;
    coding?: boolean;
  };
}

/**
 * Modelos de OpenAI Directo (MÁS BARATO que OpenRouter)
 */
export const OPENAI_MODELS: ModelInfo[] = [
  {
    id: "openai-gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    model: "gpt-4o-mini",
    description: "Modelo rápido y económico de OpenAI (directo, sin comisión)",
    capabilities: {
      streaming: true,
      tools: true,
    },
  },
  {
    id: "openai-gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    model: "gpt-4o",
    description: "Modelo más potente de OpenAI (directo)",
    capabilities: {
      streaming: true,
      tools: true,
      reasoning: true,
    },
  },
];

/**
 * Modelos de OpenRouter (con comisión adicional)
 */
export const OPENROUTER_MODELS: ModelInfo[] = [
  {
    id: "openrouter-gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openrouter",
    model: "openai/gpt-4o-mini",
    description: "Modelo rápido y económico de OpenAI",
    capabilities: {
      streaming: true,
      tools: true,
    },
  },
  {
    id: "openrouter-gpt-oss",
    name: "GPT OSS 120B",
    provider: "openrouter",
    model: "openai/gpt-oss-120b:free",
    description: "Especialista en razonamiento complejo",
    capabilities: {
      thinking: true,
      streaming: true,
      tools: true,
      reasoning: true,
    },
  },
  {
    id: "openrouter-devstral",
    name: "Devstral 2512",
    provider: "openrouter",
    model: "mistralai/devstral-2512:free",
    description: "La joya para agentes",
    capabilities: {
      streaming: true,
      tools: true,
      agents: true,
    },
  },
  {
    id: "openrouter-devstral-2",
    name: "Devstral 2 2512",
    provider: "openrouter",
    model: "mistralai/devstral-2512:free",
    description:
      "Especialista en codificación agéntica con 123B parámetros y contexto de 256K",
    capabilities: {
      streaming: true,
      tools: true,
      agents: true,
      coding: true,
    },
  },
  {
    id: "openrouter-qwen3-4b",
    name: "Qwen3 4B",
    provider: "openrouter",
    model: "qwen/qwen3-4b:free",
    description:
      "Modelo de 4B con arquitectura dual (thinking/non-thinking) para razonamiento lógico y chat",
    capabilities: {
      thinking: true,
      streaming: true,
      tools: true,
      reasoning: true,
      agents: true,
    },
  },
  {
    id: "openrouter-qwen3-coder",
    name: "Qwen3 Coder 480B A35B",
    provider: "openrouter",
    model: "qwen/qwen3-coder:free",
    description:
      "Modelo MoE de 480B parámetros optimizado para codificación agéntica y contexto largo",
    capabilities: {
      streaming: true,
      tools: true,
      coding: true,
      agents: true,
      reasoning: true,
    },
  },
  {
    id: "openrouter-nemotron",
    name: "Nemotron 3 Nano 30B",
    provider: "openrouter",
    model: "nvidia/nemotron-3-nano-30b-a3b:free",
    description: "Especialista en razonamiento",
    capabilities: {
      streaming: true,
      tools: true,
      reasoning: true,
    },
  },
  {
    id: "openrouter-kat-coder",
    name: "KAT Coder Pro",
    provider: "openrouter",
    model: "kwaipilot/kat-coder-pro:free",
    description: "Especialista en código",
    capabilities: {
      thinking: true,
      streaming: true,
      tools: true,
      coding: true,
    },
  },
];

/**
 * Modelos de Google Gemini
 */
export const GEMINI_MODELS: ModelInfo[] = [
  {
    id: "gemini-robotics-er-1.5-preview",
    name: "Gemini Robotics ER 1.5 Preview",
    provider: "gemini",
    model: "gemini-robotics-er-1.5-preview",
    description: "Modelo Gemini especializado en robótica, preview.",
    capabilities: {
      streaming: true,
      tools: true,
      reasoning: true,
    },
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    model: "gemini-2.5-flash",
    description: "Modelo rápido y estable de Google Gemini 2.5.",
    capabilities: {
      streaming: true,
      tools: true,
    },
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    provider: "gemini",
    model: "gemini-2.5-flash-lite",
    description:
      "Versión ligera de Gemini 2.5 Flash, ideal para tareas rápidas.",
    capabilities: {
      streaming: true,
      tools: true,
    },
  },
];

/**
 * Modelos locales (LM Studio)
 */
export const LOCAL_MODELS: ModelInfo[] = [
  {
    id: "lmstudio-qwen3-4b",
    name: "Qwen 3 4B (con thinking)",
    provider: "lmstudio",
    model: "qwen/qwen3-4b",
    description: "Modelo local con capacidad de razonamiento",
    capabilities: {
      thinking: true,
      streaming: true,
      tools: true,
    },
  },
  {
    id: "lmstudio-qwen3-1.7b",
    name: "Qwen 3 1.7B (con thinking)",
    provider: "lmstudio",
    model: "qwen/qwen3-1.7b",
    description: "Modelo local ligero",
    capabilities: {
      thinking: true,
      streaming: true,
      tools: true,
    },
  },
];

/**
 * Todos los modelos disponibles
 */
export const ALL_MODELS: ModelInfo[] = [
  ...OPENAI_MODELS,
  ...OPENROUTER_MODELS,
  ...GEMINI_MODELS,
  ...LOCAL_MODELS,
];

/**
 * Proveedores disponibles
 */
export const PROVIDERS: {
  id: LLMProvider;
  name: string;
  description: string;
}[] = [
  {
    id: "openai",
    name: "OpenAI (Directo)",
    description: "API directa de OpenAI - Más barato, sin comisión",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Modelos de OpenAI, Mistral, NVIDIA y más (+comisión)",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Modelos de Google",
  },
  {
    id: "lmstudio",
    name: "LM Studio (Local)",
    description: "Modelos locales ejecutándose en tu máquina",
  },
];

/**
 * Obtiene modelos por proveedor
 */
export function getModelsByProvider(provider: LLMProvider): ModelInfo[] {
  switch (provider) {
    case "openai":
      return OPENAI_MODELS;
    case "openrouter":
      return OPENROUTER_MODELS;
    case "gemini":
      return GEMINI_MODELS;
    case "lmstudio":
      return LOCAL_MODELS;
    default:
      return [];
  }
}

/**
 * Obtiene un modelo por su ID
 */
export function getModelById(id: string): ModelInfo | undefined {
  return ALL_MODELS.find((m) => m.id === id);
}

/**
 * Modelo por defecto (OpenAI directo = más barato)
 */
export const DEFAULT_MODEL = OPENAI_MODELS[0]; // GPT-4o Mini directo
