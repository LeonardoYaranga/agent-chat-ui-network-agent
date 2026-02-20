# Agent Chat UI

Agent Chat UI is a Next.js application which enables chatting with any LangGraph server with a `messages` key through a chat interface.

> [!NOTE]
> 🎥 Watch the video setup guide [here](https://youtu.be/lInrwVnZ83o).

## Setup

> [!TIP]
> Don't want to run the app locally? Use the deployed site here: [agentchat.vercel.app](https://agentchat.vercel.app)!

First, clone the repository, or run the [`npx` command](https://www.npmjs.com/package/create-agent-chat-app):

```bash
npx create-agent-chat-app
```

or

```bash
git clone https://github.com/langchain-ai/agent-chat-ui.git

cd agent-chat-ui
```

Install dependencies:

```bash
pnpm install
```

Run the app:

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

## Usage

Once the app is running (or if using the deployed site), you'll be prompted to enter:

- **Deployment URL**: The URL of the LangGraph server you want to chat with. This can be a production or development URL.
- **Assistant/Graph ID**: The name of the graph, or ID of the assistant to use when fetching, and submitting runs via the chat interface.
- **LangSmith API Key**: (only required for connecting to deployed LangGraph servers) Your LangSmith API key to use when authenticating requests sent to LangGraph servers.

After entering these values, click `Continue`. You'll then be redirected to a chat interface where you can start chatting with your LangGraph server.

## Environment Variables

You can bypass the initial setup form by setting the following environment variables:

```bash
NEXT_PUBLIC_API_URL=http://localhost:2024
NEXT_PUBLIC_ASSISTANT_ID=agent
```

> [!TIP]
> If you want to connect to a production LangGraph server, read the [Going to Production](#going-to-production) section.

To use these variables:

1. Copy the `.env.example` file to a new file named `.env`
2. Fill in the values in the `.env` file
3. Restart the application

When these environment variables are set, the application will use them instead of showing the setup form.

## Hiding Messages in the Chat

You can control the visibility of messages within the Agent Chat UI in two main ways:

**1. Prevent Live Streaming:**

To stop messages from being displayed _as they stream_ from an LLM call, add the `langsmith:nostream` tag to the chat model's configuration. The UI normally uses `on_chat_model_stream` events to render streaming messages; this tag prevents those events from being emitted for the tagged model.

_Python Example:_

```python
from langchain_anthropic import ChatAnthropic

# Add tags via the .with_config method
model = ChatAnthropic().with_config(
    config={"tags": ["langsmith:nostream"]}
)
```

_TypeScript Example:_

```typescript
import { ChatAnthropic } from "@langchain/anthropic";

const model = new ChatAnthropic()
  // Add tags via the .withConfig method
  .withConfig({ tags: ["langsmith:nostream"] });
```

**Note:** Even if streaming is hidden this way, the message will still appear after the LLM call completes if it's saved to the graph's state without further modification.

**2. Hide Messages Permanently:**

To ensure a message is _never_ displayed in the chat UI (neither during streaming nor after being saved to state), prefix its `id` field with `do-not-render-` _before_ adding it to the graph's state, along with adding the `langsmith:do-not-render` tag to the chat model's configuration. The UI explicitly filters out any message whose `id` starts with this prefix.

_Python Example:_

```python
result = model.invoke([messages])
# Prefix the ID before saving to state
result.id = f"do-not-render-{result.id}"
return {"messages": [result]}
```

_TypeScript Example:_

```typescript
const result = await model.invoke([messages]);
// Prefix the ID before saving to state
result.id = `do-not-render-${result.id}`;
return { messages: [result] };
```

This approach guarantees the message remains completely hidden from the user interface.

## Rendering Artifacts

The Agent Chat UI supports rendering artifacts in the chat. Artifacts are rendered in a side panel to the right of the chat. To render an artifact, you can obtain the artifact context from the `thread.meta.artifact` field. Here's a sample utility hook for obtaining the artifact context:

```tsx
export function useArtifact<TContext = Record<string, unknown>>() {
  type Component = (props: {
    children: React.ReactNode;
    title?: React.ReactNode;
  }) => React.ReactNode;

  type Context = TContext | undefined;

  type Bag = {
    open: boolean;
    setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;

    context: Context;
    setContext: (value: Context | ((prev: Context) => Context)) => void;
  };

  const thread = useStreamContext<
    { messages: Message[]; ui: UIMessage[] },
    { MetaType: { artifact: [Component, Bag] } }
  >();

  return thread.meta?.artifact;
}
```

After which you can render additional content using the `Artifact` component from the `useArtifact` hook:

```tsx
import { useArtifact } from "../utils/use-artifact";
import { LoaderIcon } from "lucide-react";

export function Writer(props: {
  title?: string;
  content?: string;
  description?: string;
}) {
  const [Artifact, { open, setOpen }] = useArtifact();

  return (
    <>
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer rounded-lg border p-4"
      >
        <p className="font-medium">{props.title}</p>
        <p className="text-sm text-gray-500">{props.description}</p>
      </div>

      <Artifact title={props.title}>
        <p className="whitespace-pre-wrap p-4">{props.content}</p>
      </Artifact>
    </>
  );
}
```

## Going to Production

Once you're ready to go to production, you'll need to update how you connect, and authenticate requests to your deployment. By default, the Agent Chat UI is setup for local development, and connects to your LangGraph server directly from the client. This is not possible if you want to go to production, because it requires every user to have their own LangSmith API key, and set the LangGraph configuration themselves.

### Production Setup

To productionize the Agent Chat UI, you'll need to pick one of two ways to authenticate requests to your LangGraph server. Below, I'll outline the two options:

### Quickstart - API Passthrough

The quickest way to productionize the Agent Chat UI is to use the [API Passthrough](https://github.com/bracesproul/langgraph-nextjs-api-passthrough) package ([NPM link here](https://www.npmjs.com/package/langgraph-nextjs-api-passthrough)). This package provides a simple way to proxy requests to your LangGraph server, and handle authentication for you.

This repository already contains all of the code you need to start using this method. The only configuration you need to do is set the proper environment variables.

```bash
NEXT_PUBLIC_ASSISTANT_ID="agent"
# This should be the deployment URL of your LangGraph server
LANGGRAPH_API_URL="https://my-agent.default.us.langgraph.app"
# This should be the URL of your website + "/api". This is how you connect to the API proxy
NEXT_PUBLIC_API_URL="https://my-website.com/api"
# Your LangSmith API key which is injected into requests inside the API proxy
LANGSMITH_API_KEY="lsv2_..."
```

Let's cover what each of these environment variables does:

- `NEXT_PUBLIC_ASSISTANT_ID`: The ID of the assistant you want to use when fetching, and submitting runs via the chat interface. This still needs the `NEXT_PUBLIC_` prefix, since it's not a secret, and we use it on the client when submitting requests.
- `LANGGRAPH_API_URL`: The URL of your LangGraph server. This should be the production deployment URL.
- `NEXT_PUBLIC_API_URL`: The URL of your website + `/api`. This is how you connect to the API proxy. For the [Agent Chat demo](https://agentchat.vercel.app), this would be set as `https://agentchat.vercel.app/api`. You should set this to whatever your production URL is.
- `LANGSMITH_API_KEY`: Your LangSmith API key to use when authenticating requests sent to LangGraph servers. Once again, do _not_ prefix this with `NEXT_PUBLIC_` since it's a secret, and is only used on the server when the API proxy injects it into the request to your deployed LangGraph server.

For in depth documentation, consult the [LangGraph Next.js API Passthrough](https://www.npmjs.com/package/langgraph-nextjs-api-passthrough) docs.

### Advanced Setup - Custom Authentication

Custom authentication in your LangGraph deployment is an advanced, and more robust way of authenticating requests to your LangGraph server. Using custom authentication, you can allow requests to be made from the client, without the need for a LangSmith API key. Additionally, you can specify custom access controls on requests.

To set this up in your LangGraph deployment, please read the LangGraph custom authentication docs for [Python](https://langchain-ai.github.io/langgraph/tutorials/auth/getting_started/), and [TypeScript here](https://langchain-ai.github.io/langgraphjs/how-tos/auth/custom_auth/).

Once you've set it up on your deployment, you should make the following changes to the Agent Chat UI:

1. Configure any additional API requests to fetch the authentication token from your LangGraph deployment which will be used to authenticate requests from the client.
2. Set the `NEXT_PUBLIC_API_URL` environment variable to your production LangGraph deployment URL.
3. Set the `NEXT_PUBLIC_ASSISTANT_ID` environment variable to the ID of the assistant you want to use when fetching, and submitting runs via the chat interface.
4. Modify the [`useTypedStream`](src/providers/Stream.tsx) (extension of `useStream`) hook to pass your authentication token through headers to the LangGraph server:

```tsx
const streamValue = useTypedStream({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID,
  // ... other fields
  defaultHeaders: {
    Authentication: `Bearer ${addYourTokenHere}`, // this is where you would pass your authentication token
  },
});
```

---

## 🚀 Mejoras y Características Adicionales

Este repositorio es un **fork mejorado** del [Agent Chat UI oficial de LangChain](https://github.com/langchain-ai/agent-chat-ui), con funcionalidades extendidas para proyectos de automatización de redes y casos de uso avanzados.

### 📌 Consideraciones Importantes sobre Configuración Estática

#### 🔧 MCP Selector - Herramientas Estáticas

El componente `MCPSelector` tiene las herramientas MCP **configuradas de forma estática** en el código del frontend. Actualmente **no se obtienen dinámicamente del backend** porque:

- ❌ La API de LangGraph no proporciona un endpoint estándar para listar herramientas MCP disponibles
- ❌ Crear endpoints personalizados requeriría modificar significativamente el servidor LangGraph
- ⚠️ **IMPORTANTE**: Si agregas o modificas herramientas MCP en el backend, **debes actualizar manualmente** el archivo [`MCPSelector.tsx`](src/components/MCPSelector.tsx)

**Ubicación de configuración**:

```typescript
// Frontend: src/components/MCPSelector.tsx
const MCP_SERVERS = {
  github: {
    label: "gitHub",
    tools: ["create_branch", "create_or_update_file", ...],
  },
  networkAutomation: {
    label: "Network Automation",
    tools: ["generate_router_cisco_config"],
  },
  // ... otros servidores
};
```

#### 🤖 Selector de Modelos - Sincronización Frontend/Backend

Los modelos LLM disponibles están definidos en **dos archivos que deben mantenerse sincronizados**:

- 📁 **Frontend**: [`src/lib/models.ts`](src/lib/models.ts)
- 📁 **Backend**: `mcp_client_langchain_network_agent/src/config/models.ts`

**⚠️ CRÍTICO**: Cuando agregues o modifiques modelos:

1. ✅ Actualiza **ambos archivos** manualmente
2. ✅ Asegúrate que `id`, `provider` y `model` coincidan exactamente
3. ✅ Verifica que la configuración sea consistente

**Por qué no hay endpoint dinámico**:

- ❌ LangGraph Server no soporta endpoints REST personalizados fácilmente
- ❌ Requeriría un servidor Express adicional
- ✅ La solución actual es simple y funciona sin complejidad adicional

📚 **Lee más sobre esto**:

- [IMPLEMENTACION_SELECTOR_MODELOS.md](IMPLEMENTACION_SELECTOR_MODELOS.md) - Explicación detallada de la implementación
- [SINCRONIZACION_MODELOS_FRONTEND_BACKEND.md](SINCRONIZACION_MODELOS_FRONTEND_BACKEND.md) - Guía completa sobre sincronización

### ✨ Funcionalidades Implementadas

#### 🔐 Sistema de Autenticación

Sistema completo de login con gestión de usuarios y sesiones.

📚 **Documentación**: [AUTH_README.md](AUTH_README.md)

#### 💬 Nombres Descriptivos para Chats

Mejora en la identificación de threads/conversaciones. En lugar de mostrar solo IDs numéricos (ej: `thread_12345`), ahora los chats muestran nombres descriptivos basados en el contenido.

📚 **Documentación**: [CAMBIOS_IMPLEMENTADOS-NombresChats.md](CAMBIOS_IMPLEMENTADOS-NombresChats.md)

#### 🛠️ Fix: Reject con Feedback

Corrección del comportamiento del botón "Reject" en interrupciones del agente. Ahora funciona correctamente permitiendo dar feedback al rechazar una acción sugerida.

📚 **Documentación**: [IMPLEMENTACION_REJECT_CON_FEEDBACK.md](IMPLEMENTACION_REJECT_CON_FEEDBACK.md)

#### 🎛️ Selector Dinámico de Modelos LLM

Cambia entre diferentes modelos (OpenAI, OpenRouter, Gemini, LM Studio) sin reiniciar el servidor.

**Características**:

- ✅ Cambio de modelo en tiempo real
- ✅ Soporte para múltiples proveedores
- ✅ Persistencia de selección en `localStorage`
- ✅ UI elegante con búsqueda y badges de capacidades

#### 🔌 Selector de Servidores MCP

Habilita/deshabilita servidores MCP y sus herramientas específicas desde la interfaz.

**Características**:

- ✅ Activación selectiva de servidores (GitHub, Network Automation, Net Command)
- ✅ Control granular de herramientas por servidor
- ✅ UI intuitiva con checkboxes y agrupación

### 🎓 Guía de Mantenimiento

#### Agregar un Nuevo Modelo LLM

1. Edita `src/lib/models.ts` (frontend):

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
    },
  },
  // ... otros modelos
];
```

2. Edita `mcp_client_langchain_network_agent/src/config/models.ts` (backend):

```typescript
export const OPENROUTER_MODELS: ModelInfo[] = [
  {
    id: "mi-nuevo-modelo",
    model: "company/model-name",
    provider: "openrouter",
    config: {
      maxTokens: 8000,
      timeout: 300000,
    },
  },
  // ... otros modelos
];
```

⚠️ Asegúrate que `id`, `provider` y `model` **coincidan exactamente** en ambos archivos.

#### Agregar una Nueva Herramienta MCP

1. Implementa la herramienta en tu servidor MCP backend
2. Actualiza `src/components/MCPSelector.tsx`:

```typescript
const MCP_SERVERS = {
  miServidor: {
    label: "Mi Servidor",
    tools: ["mi_nueva_herramienta", "otra_herramienta"],
  },
  // ... otros servidores
};
```

### 🔗 Enlaces Útiles

- 🌐 **Repositorio Original**: [github.com/langchain-ai/agent-chat-ui](https://github.com/langchain-ai/agent-chat-ui)
- 📖 **Documentación LangGraph**: [langchain-ai.github.io/langgraph](https://langchain-ai.github.io/langgraph/)
- 🛠️ **LangGraph API Reference**: [langchain-ai.github.io/langgraph/reference/](https://langchain-ai.github.io/langgraph/reference/)

---

## 📄 Licencia

Ver archivo [LICENSE](LICENSE) para más detalles.
