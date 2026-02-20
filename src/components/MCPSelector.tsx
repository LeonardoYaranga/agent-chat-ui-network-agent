"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useMCP } from "@/hooks/useMCP";
import { ChevronDown } from "lucide-react";

// Define los servidores disponibles y sus herramientas
// NOTA: Estos nombres se obtienen del backend en mcp-config.json
// A futuro: se podría hacer un endpoint para obtenerlos dinámicamente
const MCP_SERVERS = {
  github: {
    label: "gitHub",
    tools: [
      "create_branch",
      "create_or_update_file",
      "create_pull_request",
      "delete_file",
      "get_file_contents",
      "get_me",
      "list_branches",
      "list_commits",
      "list_pull_requests",
      "merge_pull_request",
      "push_files",
    ],
  },
  networkAutomation: {
    label: "Network Automation",
    tools: ["generate_router_cisco_config"],
  },
  netCommand: {
    label: "Net Command",
    tools: [
      "execute_ssh_command",
      "execute_telnet_command",
      "list_eve_labs",
      "list_active_nodes",
    ],
  },
};

export function MCPSelector() {
  const { mcpSelection, setMCPSelection } = useMCP();
  const [open, setOpen] = useState(false);

  const toggleServer = (serverId: string) => {
    const currentEnabled = mcpSelection.enabledServers || [];
    const newEnabled = currentEnabled.includes(serverId)
      ? currentEnabled.filter((s) => s !== serverId)
      : [...currentEnabled, serverId];

    setMCPSelection({
      ...mcpSelection,
      enabledServers: newEnabled,
    });
  };

  const toggleTool = (serverId: string, tool: string) => {
    const currentAllowed = mcpSelection.allowedToolsByServer || {};
    const serverTools = currentAllowed[serverId] || [];

    const newServerTools = serverTools.includes(tool)
      ? serverTools.filter((t) => t !== tool)
      : [...serverTools, tool];

    setMCPSelection({
      ...mcpSelection,
      allowedToolsByServer: {
        ...currentAllowed,
        [serverId]: newServerTools,
      },
    });
  };

  const toggleAllToolsForServer = (serverId: string) => {
    const currentAllowed = mcpSelection.allowedToolsByServer || {};
    const availableTools =
      MCP_SERVERS[serverId as keyof typeof MCP_SERVERS]?.tools || [];
    const serverTools = currentAllowed[serverId] || [];

    const allSelected = serverTools.length === availableTools.length;

    setMCPSelection({
      ...mcpSelection,
      allowedToolsByServer: {
        ...currentAllowed,
        [serverId]: allSelected ? [] : availableTools,
      },
    });
  };

  const enabledCount = mcpSelection.enabledServers?.length || 0;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          MCP Servers ({enabledCount})
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        align="start"
      >
        <div className="space-y-4">
          <h3 className="font-semibold">MCP Servers & Tools</h3>

          {Object.entries(MCP_SERVERS).map(([serverId, serverConfig]) => {
            const isEnabled =
              mcpSelection.enabledServers?.includes(serverId) || false;
            const serverTools =
              mcpSelection.allowedToolsByServer?.[serverId] || [];
            const allToolsSelected =
              serverTools.length === serverConfig.tools.length;

            return (
              <div
                key={serverId}
                className="space-y-2 border-b pb-3"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={serverId}
                    checked={isEnabled}
                    onCheckedChange={() => toggleServer(serverId)}
                  />
                  <Label
                    htmlFor={serverId}
                    className="cursor-pointer font-medium"
                  >
                    {serverConfig.label}
                  </Label>
                </div>

                {isEnabled && (
                  <div className="ml-6 space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => toggleAllToolsForServer(serverId)}
                    >
                      {allToolsSelected
                        ? "Deseleccionar todo"
                        : "Seleccionar todo"}
                    </Button>
                    <div className="space-y-1">
                      {serverConfig.tools.map((tool) => (
                        <div
                          key={tool}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`${serverId}-${tool}`}
                            checked={serverTools.includes(tool)}
                            onCheckedChange={() => toggleTool(serverId, tool)}
                          />
                          <Label
                            htmlFor={`${serverId}-${tool}`}
                            className="cursor-pointer text-sm font-normal"
                          >
                            {tool}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
