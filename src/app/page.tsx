"use client";

import { ChatPanel } from "@/components/layout/ChatPanel";
import { TripPanel } from "@/components/layout/TripPanel";
import { TripContextSync } from "@/lib/trip-context";
import { components, tools } from "@/lib/tambo";
import { TamboProvider, type McpServerInfo } from "@tambo-ai/react";

// MCP Server configuration
const mcpServers: McpServerInfo[] = [
  {
    name: "WanderAI Attractions",
    url: "http://localhost:3001/message",
    serverKey: "attractions",
    description: "Search for tourist attractions and points of interest",
  },
];

export default function Home() {
  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      mcpServers={mcpServers}
    >
      {/* Sync trip state to AI context */}
      <TripContextSync />

      <main className="h-screen flex overflow-hidden">
        {/* Chat Panel - 40% */}
        <div className="w-[40%] min-w-[380px] max-w-[520px] h-full flex-shrink-0 border-r border-wander-slate/10">
          <ChatPanel />
        </div>

        {/* Trip Plan Panel - 60% */}
        <div className="flex-1 h-full">
          <TripPanel />
        </div>
      </main>
    </TamboProvider>
  );
}
