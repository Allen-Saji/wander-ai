"use client";

import { ChatPanel } from "@/components/layout/ChatPanel";
import { TripPanel } from "@/components/layout/TripPanel";
import { TripContextSync } from "@/lib/trip-context";
import { components, tools } from "@/lib/tambo";
import { useAuth } from "@/lib/auth-context";
import { usePersistedThreads } from "@/lib/use-persisted-threads";
import { TamboProvider, useTambo, type McpServerInfo } from "@tambo-ai/react";
import { Loader2 } from "lucide-react";

const mcpServers: McpServerInfo[] = [
  {
    name: "WanderAI Attractions",
    url: "http://localhost:3001/message",
    serverKey: "attractions",
    description: "Search for tourist attractions and points of interest",
  },
];

function AppLayout({
  persistThread,
  userThreads,
}: {
  persistThread: (id: string, title?: string) => Promise<void>;
  userThreads: ReturnType<typeof usePersistedThreads>["userThreads"];
}) {
  const { thread } = useTambo();
  const hasMessages = thread?.messages && thread.messages.length > 0;

  return (
    <>
      <TripContextSync />
      <main className="h-screen flex overflow-hidden">
        {/* Chat panel — full width when empty, 40% when has messages */}
        <div
          className={`h-full flex-shrink-0 border-r border-wander-slate/10 transition-all duration-500 ease-in-out ${
            hasMessages
              ? "w-[40%] min-w-[380px] max-w-[520px]"
              : "w-full"
          }`}
        >
          <ChatPanel
            persistThread={persistThread}
            userThreads={userThreads}
            isExpanded={!hasMessages}
          />
        </div>

        {/* Trip panel — slides in when messages exist */}
        <div
          className={`h-full transition-all duration-500 ease-in-out overflow-hidden ${
            hasMessages ? "flex-1 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <TripPanel />
        </div>
      </main>
    </>
  );
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { persistThread, userThreads, loading: threadsLoading } =
    usePersistedThreads();

  if (authLoading || threadsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-wander-charcoal">
        <Loader2 className="w-6 h-6 text-wander-copper animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      mcpServers={mcpServers}
    >
      <AppLayout persistThread={persistThread} userThreads={userThreads} />
    </TamboProvider>
  );
}
