import { Button } from "@/components/ui/button";
import { useThreads } from "@/providers/Thread";
import { Thread } from "@langchain/langgraph-sdk";
import { useEffect, useState } from "react";

import { getContentString } from "../utils";
import { useQueryState, parseAsBoolean } from "nuqs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelRightOpen, PanelRightClose, Trash2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * @description Extrae el título del thread basándose en el primer mensaje
 * @param thread - El thread de LangGraph
 * @returns Título del thread o el thread_id si no hay mensajes
 */
function getThreadTitle(thread: Thread): string {
  if (
    typeof thread.values === "object" &&
    thread.values &&
    "messages" in thread.values &&
    Array.isArray(thread.values.messages) &&
    thread.values.messages?.length > 0
  ) {
    // Obtener el primer mensaje del usuario (si existe)
    const userMessages = thread.values.messages.filter(
      (msg: any) => msg.type === "human" || msg.role === "user",
    );

    if (userMessages.length > 0) {
      const firstUserMessage = getContentString(userMessages[0].content);
      // Limitar a 50 caracteres y agregar puntos suspensivos si es muy largo
      return firstUserMessage.length > 50
        ? firstUserMessage.substring(0, 50) + "..."
        : firstUserMessage;
    }
  }
  return thread.thread_id.substring(0, 12) + "...";
}

/**
 * @description Obtiene la fecha del último mensaje del thread
 * @param thread - El thread de LangGraph
 * @returns Fecha formateada o "N/A"
 */
function getThreadDate(thread: Thread): string {
  // Usar updated_at si existe, sino created_at
  const dateString = (thread as any).updated_at || (thread as any).created_at;

  if (dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return "None";
}

function ThreadList({
  threads,
  onThreadClick,
  onDeleteThread,
}: {
  threads: Thread[];
  onThreadClick?: (threadId: string) => void;
  onDeleteThread?: (threadId: string) => Promise<void>;
}) {
  const [threadId, setThreadId] = useQueryState("threadId");
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);

  const handleDelete = async (
    e: React.MouseEvent,
    threadIdToDelete: string,
  ) => {
    e.stopPropagation();

    if (
      !confirm(
        "¿Estás seguro que deseas eliminar este chat? Se borrarán todos los mensajes.",
      )
    ) {
      return;
    }

    setDeletingThreadId(threadIdToDelete);
    try {
      await onDeleteThread?.(threadIdToDelete);
      // Si estábamos viendo este thread, limpiar la selección
      if (threadId === threadIdToDelete) {
        setThreadId(null);
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
      alert("Error al eliminar el chat");
    } finally {
      setDeletingThreadId(null);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {threads.map((t) => {
        const title = getThreadTitle(t);
        const date = getThreadDate(t);
        const isSelected = threadId === t.thread_id;
        const isDeleting = deletingThreadId === t.thread_id;

        return (
          <div
            key={t.thread_id}
            className={`group relative w-full rounded-lg px-2 py-1 transition-all ${
              isSelected ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
          >
            <Button
              variant="ghost"
              className="w-full items-start justify-start text-left font-normal disabled:opacity-50"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                onThreadClick?.(t.thread_id);
                if (t.thread_id === threadId) return;
                setThreadId(t.thread_id);
              }}
            >
              <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-ellipsis">
                  {title}
                </p>
                <p className="text-xs text-gray-500">{date}</p>
              </div>
            </Button>

            {/* Botón de eliminar - visible al hover */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1/2 right-1 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => handleDelete(e, t.thread_id)}
              disabled={isDeleting}
            >
              <Trash2 className="size-4 text-red-500" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}

function ThreadHistoryLoading() {
  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {Array.from({ length: 30 }).map((_, i) => (
        <Skeleton
          key={`skeleton-${i}`}
          className="h-10 w-[280px]"
        />
      ))}
    </div>
  );
}

export default function ThreadHistory() {
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(false),
  );

  const {
    getThreads,
    threads,
    setThreads,
    threadsLoading,
    setThreadsLoading,
    deleteThread,
  } = useThreads();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setThreadsLoading(true);
    getThreads()
      .then((threads) => {
        setThreads(threads);
      })
      .catch((error) => {
        console.error("Error cargando threads:", error);
      })
      .finally(() => {
        setThreadsLoading(false);
      });
  }, []);

  /**
   * @description Maneja la eliminación de un thread
   * @param threadId - ID del thread a eliminar
   */
  const handleDeleteThread = async (threadId: string) => {
    try {
      await deleteThread(threadId);
      // Actualizar la lista de threads removiendo el eliminado
      setThreads(threads.filter((t) => t.thread_id !== threadId));
    } catch (error) {
      console.error("Error deleting thread:", error);
      throw error;
    }
  };

  return (
    <>
      <div className="shadow-inner-right hidden h-screen w-[300px] shrink-0 flex-col items-start justify-start gap-6 border-r-[1px] border-slate-300 lg:flex">
        <div className="flex w-full items-center justify-between px-4 pt-1.5">
          <Button
            className="hover:bg-gray-100"
            variant="ghost"
            onClick={() => setChatHistoryOpen((p) => !p)}
          >
            {chatHistoryOpen ? (
              <PanelRightOpen className="size-5" />
            ) : (
              <PanelRightClose className="size-5" />
            )}
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">Chats</h1>
        </div>
        {threadsLoading ? (
          <ThreadHistoryLoading />
        ) : (
          <ThreadList
            threads={threads}
            onDeleteThread={handleDeleteThread}
          />
        )}
      </div>
      <div className="lg:hidden">
        <Sheet
          open={!!chatHistoryOpen && !isLargeScreen}
          onOpenChange={(open) => {
            if (isLargeScreen) return;
            setChatHistoryOpen(open);
          }}
        >
          <SheetContent
            side="left"
            className="flex lg:hidden"
          >
            <SheetHeader>
              <SheetTitle>Chats</SheetTitle>
            </SheetHeader>
            <ThreadList
              threads={threads}
              onThreadClick={() => setChatHistoryOpen((o) => !o)}
              onDeleteThread={handleDeleteThread}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
