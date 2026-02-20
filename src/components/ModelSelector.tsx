"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Sparkles, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  PROVIDERS,
  getModelsByProvider,
  type LLMProvider,
  type ModelInfo,
  type LLMConfig,
} from "@/lib/models";

export interface ModelSelectorProps {
  selectedModel: ModelInfo;
  onModelChange: (config: LLMConfig) => void;
  className?: string;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  className,
}: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedProvider, setSelectedProvider] = React.useState<LLMProvider>(
    selectedModel.provider,
  );
  const [search, setSearch] = React.useState("");

  const models = getModelsByProvider(selectedProvider);

  const filteredModels = React.useMemo(() => {
    if (!search) return models;
    const query = search.toLowerCase();
    return models.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.model.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query),
    );
  }, [models, search]);

  const handleModelSelect = (model: ModelInfo) => {
    console.log("🎯 MODEL CLICKED:", model.name, model.model, model.provider);
    onModelChange({
      provider: model.provider,
      model: model.model,
    });
    setOpen(false);
    setSearch("");
  };

  const handleProviderChange = (providerId: string) => {
    console.log("🔄 PROVIDER CLICKED:", providerId);
    const newProvider = providerId as LLMProvider;
    setSelectedProvider(newProvider);
    setSearch("");

    // Automatically select the first model of the new provider
    const newProviderModels = getModelsByProvider(newProvider);
    if (newProviderModels.length > 0) {
      onModelChange({
        provider: newProvider,
        model: newProviderModels[0].model,
      });
      setOpen(false);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[280px] justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="text-muted-foreground h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{selectedModel.name}</span>
              <span className="text-muted-foreground text-xs capitalize">
                {selectedModel.provider}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Buscar modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {/* Provider selector */}
            <div className="p-1">
              <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                Proveedor
              </div>
              {PROVIDERS.map((provider) => (
                <div
                  key={provider.id}
                  onClick={() => handleProviderChange(provider.id)}
                  className="hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none select-none"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProvider === provider.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{provider.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {provider.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-border -mx-1 my-1 h-px" />

            {/* Models for selected provider */}
            <div className="p-1">
              <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                Modelos de{" "}
                {PROVIDERS.find((p) => p.id === selectedProvider)?.name}
              </div>
              {filteredModels.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  No se encontraron modelos
                </div>
              ) : (
                filteredModels.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className="hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none select-none"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedModel.id === model.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{model.name}</span>
                        {model.capabilities.thinking && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            thinking
                          </span>
                        )}
                        {model.capabilities.reasoning && (
                          <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                            reasoning
                          </span>
                        )}
                        {model.capabilities.coding && (
                          <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                            coding
                          </span>
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {model.description}
                      </span>
                      <span className="text-muted-foreground/70 font-mono text-xs">
                        {model.model}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
