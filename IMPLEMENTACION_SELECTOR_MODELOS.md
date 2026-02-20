# Cambios Implementados: Selector Dinámico de Modelos LLM

## 📋 Resumen

Se ha implementado la funcionalidad para **cambiar dinámicamente el proveedor y modelo LLM** desde el frontend **sin necesidad de reiniciar el servidor de LangGraph**.

## ✨ Características Implementadas

### 1. **Backend - Runtime Configuration**

- ✅ Modificado `llm-provider.ts` para aceptar configuración dinámica (`LLMConfig`)
- ✅ Actualizado `agent.ts` para leer `config?.configurable?.llmConfig` en cada request
- ✅ Creado `models.ts` con catálogo de modelos disponibles por proveedor

### 2. **Frontend - Selector de Modelos**

- ✅ Componente `ModelSelector` con UI elegante para cambiar modelos
- ✅ Contexto `ModelContext` para gestionar el modelo seleccionado globalmente
- ✅ Integración con `StreamProvider` para pasar config en cada request
- ✅ Persistencia del modelo seleccionado en `localStorage`
- ✅ Notificaciones visuales al cambiar de modelo

### 3. **Modelos Disponibles**

#### OpenRouter (Gratis)

- GPT-4o Mini ⚡ (predeterminado)
- GPT OSS 120B 🧠 (razonamiento complejo)
- Devstral 2512 🤖 (especialista en agentes)
- Nemotron 3 Nano 30B 🔬 (razonamiento)
- KAT Coder Pro 💻 (especialista en código)

#### Google Gemini

- Gemini 2.0 Flash Experimental ⚡
- Gemini 2.5 Flash
- Gemini 1.5 Pro 🧠

#### LM Studio (Local)

- Qwen 3 4B (con thinking) 💭
- Qwen 3 1.7B (con thinking) 💭

## 🎯 Cómo Funciona

### Arquitectura

```
Frontend (ModelSelector)
    ↓ selecciona modelo
ModelContext (llmConfig)
    ↓ pasa en config
StreamProvider (useStream)
    ↓ incluye en request
LangGraph Server (:2024)
    ↓ lee de config.configurable
agent.ts (callModel)
    ↓ usa llmConfig
llm-provider.ts (getLLMProvider)
    ↓ crea modelo específico
Modelo LLM seleccionado ✨
```

### Flujo de Datos

1. **Usuario selecciona modelo** en el UI (botón con ícono ✨)
2. **ModelContext actualiza** `llmConfig` con `{ provider, model }`
3. **StreamProvider pasa** config en cada `submit()`/`stream()`:
   ```typescript
   config: {
     configurable: {
       llmConfig: { provider: "gemini", model: "gemini-2.0-flash-exp" }
     }
   }
   ```
4. **Backend lee** `config?.configurable?.llmConfig`
5. **getLLMProvider** crea el LLM específico dinámicamente
6. **Conversación continúa** con el nuevo modelo (sin reinicio)

## 🚀 Uso

### En el Frontend

El selector aparece en el header de la aplicación:

```tsx
<ModelSelector
  selectedModel={selectedModel}
  onModelChange={(config) => {
    setModel(config, model);
    toast.success(`Modelo cambiado a ${model.name}`);
  }}
/>
```

### Agregar Nuevos Modelos

Edita `src/lib/models.ts` (frontend) y `src/config/models.ts` (backend):

```typescript
export const OPENROUTER_MODELS: ModelInfo[] = [
  {
    id: "mi-nuevo-modelo",
    name: "Mi Nuevo Modelo",
    provider: "openrouter",
    model: "company/model-name",
    description: "Descripción del modelo",
    capabilities: {
      streaming: true,
      tools: true,
      reasoning: true,
    },
  },
  // ... otros modelos
];
```

## 📦 Archivos Modificados/Creados

### Backend (`mcp_client_langchain_network_agent/`)

- ✏️ `src/config/llm-provider.ts` - Acepta `LLMConfig` opcional
- ✏️ `src/graph/agent.ts` - Lee `llmConfig` de runtime config
- ✨ `src/config/models.ts` - Catálogo de modelos disponibles

### Frontend (`agent-chat-ui-network-agent/`)

- ✨ `src/lib/models.ts` - Definiciones de modelos y proveedores
- ✨ `src/components/ModelSelector.tsx` - Componente selector de modelos
- ✨ `src/components/ui/popover.tsx` - Componente Popover (Radix UI)
- ✨ `src/components/ui/command.tsx` - Componente Command (cmdk)
- ✨ `src/contexts/ModelContext.tsx` - Contexto global del modelo
- ✏️ `src/providers/Stream.tsx` - Pasa `llmConfig` en requests
- ✏️ `src/app/layout.tsx` - Envuelve con `ModelProvider`
- ✏️ `src/components/thread/index.tsx` - Integra `ModelSelector` en UI

## 🔧 Dependencias Instaladas

```bash
pnpm add @radix-ui/react-popover cmdk
```

## ⚠️ Notas Importantes

### 1. **NO se requiere reiniciar el servidor**

La configuración se pasa por request mediante `config.configurable`, lo que permite cambiar modelos en caliente.

### 2. **Compatibilidad con LangGraph**

Utiliza la funcionalidad nativa de LangGraph de **runtime configuration**, documentada en:

- [LangGraph Runtime Configuration](https://docs.langchain.com/langsmith/configurable-headers)
- [Dynamic Model Selection](https://docs.langchain.com/oss/python/migrate/langchain-v1)

### 3. **Persistencia**

El modelo seleccionado se guarda en `localStorage` para mantenerlo entre recargas.

### 4. **Variables de Entorno**

Asegúrate de tener configuradas las API keys en `.env`:

```bash
OPENROUTER_API_KEY=sk-or-v1-...
GEMINI_API_KEY=AIzaSy...
LMSTUDIO_BASE_URL=http://localhost:1234/v1
```

### 5. **Modelo Predeterminado**

Si no se selecciona ninguno, usa `openai/gpt-4o-mini` (configurado en `DEFAULT_MODEL`)

## 🎨 Capacidades del Selector

- **Búsqueda rápida** de modelos
- **Agrupación por proveedor**
- **Badges visuales** para capacidades (thinking, reasoning, coding)
- **Cambio automático** al seleccionar proveedor
- **Información detallada** de cada modelo (nombre técnico, descripción)

## ✅ Testing

Para probar:

1. Inicia el backend:

   ```bash
   cd mcp_client_langchain_network_agent
   pnpm dev
   ```

2. Inicia el frontend:

   ```bash
   cd agent-chat-ui-network-agent
   pnpm dev
   ```

3. Abre http://localhost:3000
4. Haz clic en el botón del modelo (con ícono ✨) en el header
5. Selecciona un proveedor y luego un modelo
6. ¡Observa cómo cambia inmediatamente!

## 🎯 Próximas Mejoras Posibles

- [ ] Mostrar estadísticas del modelo (tokens, costo)
- [ ] Permitir ajustar `temperature` desde la UI
- [ ] Historial de modelos usados
- [ ] Comparar respuestas entre modelos
- [ ] Auto-selección basada en el tipo de tarea

---

**Implementado por**: GitHub Copilot
**Fecha**: 2026-01-01
**Versión**: 1.0.0
