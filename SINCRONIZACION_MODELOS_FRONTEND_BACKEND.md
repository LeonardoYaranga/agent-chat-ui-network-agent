# 🔄 Sincronización de Modelos entre Frontend y Backend

## ❓ ¿Por qué existen dos archivos models.ts?

Tienes dos archivos que definen los modelos:

- 📁 `mcp_client_langchain_network_agent/src/config/models.ts` (Backend)
- 📁 `agent-chat-ui-network-agent/src/lib/models.ts` (Frontend)

**¿Deberían ser iguales?** → **SÍ, la lista de modelos debe coincidir**

---

## 🎯 ¿Cómo funciona el flujo completo?

### Paso a Paso:

#### 1️⃣ **Frontend muestra modelos disponibles**

```typescript
// Frontend: src/lib/models.ts
export const GEMINI_MODELS: ModelInfo[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    model: "gemini-2.5-flash", // ← Este es el ID del modelo
    //...
  },
];
```

El `ModelSelector` lee esta lista y la muestra en el UI.

#### 2️⃣ **Usuario selecciona un modelo**

```tsx
// Usuario hace click en "Gemini 2.5 Flash"
handleModelSelect(model);
```

#### 3️⃣ **Frontend envía configuración al backend**

```typescript
// Frontend: thread/index.tsx
stream.submit(
  { messages },
  {
    config: {
      configurable: {
        llmConfig: {
          provider: "gemini", // ← Proveedor
          model: "gemini-2.5-flash", // ← ID del modelo
        },
      },
    },
  }
);
```

**Esto va al puerto 2024 (LangGraph Server)** mediante el SDK de LangGraph.

#### 4️⃣ **Backend recibe la configuración**

```typescript
// Backend: graph/agent.ts
async function callModel(state: typeof AgentState.State, config) {
  const llmConfig = config?.configurable?.llmConfig;
  // llmConfig = { provider: "gemini", model: "gemini-2.5-flash" }

  const llm = getLLMProvider(llmConfig); // ← Crea el LLM
}
```

#### 5️⃣ **Backend busca el modelo en su lista**

```typescript
// Backend: config/llm-provider.ts
export const getLLMProvider = (config?: LLMConfig): BaseChatModel => {
  const provider = config?.provider || process.env.LLM_PROVIDER;
  const modelId = config?.model || process.env.LLM_MODEL;

  if (provider === "gemini") {
    return new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: modelId, // ← "gemini-2.5-flash"
      // Busca configuración específica en models.ts
    });
  }
};
```

#### 6️⃣ **Backend usa configuración del modelo**

```typescript
// Backend: config/models.ts
export const GEMINI_MODELS: ModelInfo[] = [
  {
    model: "gemini-2.5-flash",
    config: {
      maxTokens: 8000, // ← Configuración específica
      timeout: 300000,
    },
  },
];
```

El backend necesita saber:

- ✅ Qué modelos son válidos
- ✅ Configuración específica de cada modelo (tokens, timeout)
- ✅ Validar que el frontend no envió un modelo inválido

---

## 🔍 ¿Por qué el backend tiene todos los modelos?

### Razones:

#### 1. **Validación**

Si el frontend envía `model: "modelo-que-no-existe"`, el backend puede:

- Detectarlo
- Usar el modelo por defecto
- Registrar un warning

#### 2. **Configuración Específica**

Cada modelo tiene configuración diferente:

```typescript
{
  "gemini-2.5-flash": {
    maxTokens: 8000,
    timeout: 300000
  },
  "gemini-robotics-er-1.5-preview": {
    maxTokens: 8000,
    timeout: 300000
  }
}
```

#### 3. **Fallback/Default**

Si el frontend NO envía configuración:

```typescript
// Backend usa DEFAULT_MODEL
export const DEFAULT_MODEL = OPENROUTER_MODELS[0]; // GPT-4o Mini
```

#### 4. **Metadata del Modelo**

El backend puede necesitar saber:

- ¿Soporta streaming?
- ¿Soporta function calling (tools)?
- ¿Tiene capacidades especiales (thinking, reasoning)?

---

## 📊 Comparación: ¿Qué va en cada archivo?

| Característica                  | Frontend | Backend     | ¿Debe coincidir? |
| ------------------------------- | -------- | ----------- | ---------------- |
| **Lista de modelos**            | ✅ Sí    | ✅ Sí       | ✅ **SÍ**        |
| **ID del modelo**               | ✅ Sí    | ✅ Sí       | ✅ **SÍ**        |
| **Nombre para mostrar**         | ✅ Sí    | ⚠️ Opcional | ❌ No crítico    |
| **Descripción**                 | ✅ Sí    | ⚠️ Opcional | ❌ No crítico    |
| **Capabilities (UI badges)**    | ✅ Sí    | ⚠️ Opcional | ❌ No crítico    |
| **Config (maxTokens, timeout)** | ❌ No    | ✅ **Sí**   | N/A              |
| **Providers list**              | ✅ Sí    | ❌ No       | N/A              |

### Lo CRÍTICO que debe coincidir:

```typescript
// ✅ DEBE SER IGUAL EN AMBOS
{
  id: "gemini-2.5-flash",           // ← ID único
  provider: "gemini",                // ← Proveedor
  model: "gemini-2.5-flash"          // ← ID del modelo en la API
}
```

### Lo que puede ser diferente:

```typescript
// Frontend: Solo para UI
name: "Gemini 2.5 Flash ⚡"
description: "Súper rápido y económico"

// Backend: Solo para configuración técnica
config: {
  maxTokens: 8000,
  timeout: 300000
}
```

---

## 🚫 ¿Por qué NO un endpoint API REST?

### Opción 1 (NO viable): Crear endpoint `/api/models`

```typescript
// ❌ NO HACER ESTO
app.get("/api/models", (req, res) => {
  res.json(ALL_MODELS);
});
```

**Problemas**:

- ❌ LangGraph Server (puerto 2024) NO es Express
- ❌ No puedes agregar rutas custom fácilmente
- ❌ Requeriría un servidor Express adicional
- ❌ Sobrecomplica la arquitectura

### Opción 2 (La actual - ✅ CORRECTA): Duplicar la lista

```typescript
// Frontend: models.ts
export const GEMINI_MODELS = [...]

// Backend: models.ts
export const GEMINI_MODELS = [...]
```

**Ventajas**:

- ✅ Simple
- ✅ No requiere llamadas API extra
- ✅ El frontend carga instantáneamente
- ✅ Funciona offline (durante desarrollo)

**Desventaja**:

- ⚠️ Hay que mantener ambos archivos sincronizados manualmente

---

## 🔄 ¿Cómo mantener sincronizados los archivos?

### Opción 1: Manual (actual)

Cuando agregues/modifiques un modelo:

1. Edita `backend/src/config/models.ts`
2. Edita `frontend/src/lib/models.ts`
3. Asegúrate que `id`, `provider` y `model` coincidan

### Opción 2: Script de sincronización (futuro)

```bash
# En el futuro podrías crear un script
pnpm run sync-models
```

Que copie la lista del backend al frontend.

### Opción 3: Workspace compartido (TypeScript)

Crear un paquete `@shared/models` que ambos importen:

```
packages/
  shared/
    models.ts        ← Única fuente de verdad
  backend/
    imports from @shared/models
  frontend/
    imports from @shared/models
```

---

## ✅ Estado Actual (Actualizado)

### Modelos Gemini sincronizados:

```typescript
// ✅ BACKEND: mcp_client_langchain_network_agent/src/config/models.ts
// ✅ FRONTEND: agent-chat-ui-network-agent/src/lib/models.ts

export const GEMINI_MODELS: ModelInfo[] = [
  {
    id: "gemini-robotics-er-1.5-preview",
    name: "Gemini Robotics ER 1.5 Preview",
    provider: "gemini",
    model: "gemini-robotics-er-1.5-preview",
    // ...
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    model: "gemini-2.5-flash",
    // ...
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    provider: "gemini",
    model: "gemini-2.5-flash-lite",
    // ...
  },
];
```

**Ahora ambos archivos están sincronizados** ✅

---

## 🎓 Resumen para recordar

1. **Frontend models.ts**:

   - Lista modelos para mostrar en el UI
   - Usuario los ve y selecciona

2. **Backend models.ts**:

   - Valida que el modelo recibido es válido
   - Obtiene configuración específica (tokens, timeout)
   - Proporciona modelo por defecto si no hay config

3. **Flujo**:

   ```
   Usuario selecciona → Frontend envía config → Backend valida y usa
   ```

4. **Sincronización**:

   - ✅ `id`, `provider`, `model` DEBEN coincidir
   - ⚠️ Mantener manualmente (por ahora)
   - 💡 Futuro: script de sync o paquete compartido

5. **NO endpoint API**:
   - ❌ LangGraph no es Express
   - ✅ LangGraph SÍ acepta `config.configurable`
   - ✅ Ese es el patrón correcto

---

**Actualizado**: 2026-01-02  
**Estado**: Frontend y Backend sincronizados ✅
