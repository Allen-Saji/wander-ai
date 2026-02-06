"use client";

import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/tambo/thread-content";
import {
  MessageInput,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
} from "@/components/tambo/message-input";
import {
  useTambo,
  useTamboThreadInput,
  useTamboThread,
  useTamboSuggestions,
} from "@tambo-ai/react";
import { useAuth } from "@/lib/auth-context";
import type { UserThread } from "@/lib/supabase/chat-persistence";
import {
  Compass,
  Loader2,
  Plus,
  LogOut,
  History,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Utensils,
  Heart,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Helpers ────────────────────────────────────────────────

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const starterPrompts = [
  { label: "Paris for Two", desc: "3 nights, $2k budget", icon: Heart, prompt: "Plan a 3-night romantic trip to Paris for 2 people with a $2000 budget. Include daily itineraries with restaurants, museums, and a Seine river cruise. We like wine and pastries." },
  { label: "Tokyo & Kyoto", desc: "7 days, culture + food", icon: MapPin, prompt: "Plan a 7-day trip to Japan splitting time between Tokyo (4 days) and Kyoto (3 days) on a $3000 budget for one person. Focus on street food, temples, and nightlife. Include train travel between cities." },
  { label: "Bangkok Food Tour", desc: "3 days, street food", icon: Utensils, prompt: "Plan a 3-day food-focused trip to Bangkok for 2 people on a $800 budget. Include the best street food spots, night markets, Chinatown, and a cooking class. We love spicy food." },
];

// ─── Expanded Welcome (full-width, centered like ChatGPT) ───

function ExpandedWelcome({
  onSelectPrompt,
  userThreads,
  onSelectThread,
  onSignOut,
  userEmail,
}: {
  onSelectPrompt: (prompt: string) => void;
  userThreads: UserThread[];
  onSelectThread: (threadId: string) => void;
  onSignOut: () => void;
  userEmail?: string;
}) {
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Warm copper radial glow - top right */}
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-wander-copper/8 blur-[120px] welcome-glow-drift" />
        {/* Deep warm glow - bottom left */}
        <div className="absolute -bottom-[15%] -left-[10%] w-[50%] h-[50%] rounded-full bg-wander-copper-light/5 blur-[100px] welcome-glow-drift-reverse" />
        {/* Subtle center accent */}
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40%] h-[30%] rounded-full bg-wander-copper/4 blur-[80px]" />
      </div>

      {/* Minimal top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-wander-copper to-wander-copper-light flex items-center justify-center shadow-lg shadow-wander-copper/25">
            <Compass className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <span
            className="text-base font-semibold text-wander-cream tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            WanderAI
          </span>
        </div>
        <button
          onClick={onSignOut}
          title={userEmail || "Sign out"}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-wander-cream/40 hover:text-wander-cream/70 hover:bg-wander-slate/20 transition-all text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-2xl mx-auto w-full">
        {/* Hero */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-wander-copper/10 border border-wander-copper/20 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-wander-copper-light animate-pulse" />
            <span className="text-[11px] text-wander-copper-light font-medium tracking-wide">AI-Powered Travel</span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-semibold text-wander-cream mb-3 leading-[1.1]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Where to{" "}
            <span className="bg-gradient-to-r from-wander-copper via-wander-copper-light to-wander-copper bg-clip-text text-transparent">
              next
            </span>
            ?
          </h1>
          <p className="text-wander-cream/45 text-sm max-w-sm mx-auto leading-relaxed">
            Craft your perfect itinerary. Just describe your dream trip and
            we&apos;ll plan every detail.
          </p>
        </div>

        {/* Starter prompts as horizontal cards */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-lg mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {starterPrompts.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => onSelectPrompt(item.prompt)}
                className="group relative text-left p-4 rounded-xl bg-gradient-to-b from-wander-slate/25 to-wander-slate/10 border border-wander-slate/20 hover:border-wander-copper/40 hover:from-wander-copper/10 hover:to-wander-slate/15 transition-all duration-300 hover:shadow-lg hover:shadow-wander-copper/5"
              >
                <div className="w-7 h-7 rounded-lg bg-wander-copper/10 border border-wander-copper/15 flex items-center justify-center mb-2.5 group-hover:bg-wander-copper/20 group-hover:border-wander-copper/30 transition-all duration-300">
                  <Icon className="w-3.5 h-3.5 text-wander-copper-light/70 group-hover:text-wander-copper-light transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <p className="text-wander-cream/90 text-sm font-medium leading-tight mb-1 group-hover:text-wander-cream transition-colors">
                  {item.label}
                </p>
                <p className="text-wander-cream/35 text-[11px] leading-tight group-hover:text-wander-cream/50 transition-colors">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Input with glow effect */}
        <div className="w-full max-w-lg animate-fade-in-up relative" style={{ animationDelay: "200ms" }}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-wander-copper/20 via-wander-copper-light/10 to-wander-copper/20 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <CompactInput />
        </div>

        {/* Recent trips */}
        {userThreads.length > 0 && (
          <div className="w-full max-w-lg mt-8 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-wander-slate/20 to-transparent" />
              <p className="text-[10px] text-wander-cream/30 uppercase tracking-[0.15em] font-medium">
                Recent Trips
              </p>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-wander-slate/20 to-transparent" />
            </div>
            <div className="space-y-0.5">
              {userThreads.slice(0, 5).map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => onSelectThread(thread.tambo_thread_id)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-wander-copper/5 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-1 h-1 rounded-full bg-wander-copper/30 flex-shrink-0 group-hover:bg-wander-copper-light/60 transition-colors" />
                    <span className="text-wander-cream/45 text-sm truncate group-hover:text-wander-cream/75 transition-colors">
                      {thread.title || "Untitled Trip"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] text-wander-cream/20 group-hover:text-wander-cream/35 transition-colors">
                      {formatRelativeDate(thread.updated_at)}
                    </span>
                    <ChevronRight className="w-3 h-3 text-wander-cream/10 group-hover:text-wander-copper-light/50 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Compact Input (shared) ─────────────────────────────────

function CompactInput() {
  const { isIdle } = useTamboThread();

  return (
    <MessageInput
      variant="default"
      className="bg-wander-slate/15 border-wander-slate/20 rounded-xl hover:border-wander-copper/25 focus-within:border-wander-copper/40 focus-within:bg-wander-slate/25 focus-within:shadow-lg focus-within:shadow-wander-copper/5 transition-all duration-300"
    >
      <MessageInputTextarea
        placeholder="Where do you want to go?"
        className="text-wander-cream placeholder:text-wander-cream/25 bg-transparent border-none resize-none min-h-[20px] max-h-[80px] py-1.5 px-3 text-sm text-left [&_.tiptap]:text-left [&_.tiptap.ProseMirror]:min-h-[20px]"
      />
      <MessageInputToolbar className="px-1.5 pb-1.5 pt-0 mt-0 [&>div]:gap-1">
        {!isIdle ? (
          <div className="flex items-center px-2 py-1 text-wander-copper-light">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : (
          <MessageInputSubmitButton className="!w-7 !h-7 bg-gradient-to-br from-wander-copper to-wander-copper-light hover:from-wander-copper-light hover:to-wander-copper text-white rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-20 shadow-sm shadow-wander-copper/20" />
        )}
      </MessageInputToolbar>
    </MessageInput>
  );
}

// ─── Suggestion Chips ───────────────────────────────────────

function SuggestionChips() {
  const { suggestions, accept, isPending } = useTamboSuggestions({ maxSuggestions: 2 });
  const { isIdle } = useTamboThread();
  if (!isIdle || suggestions.length === 0) return null;

  return (
    <div className="px-4 pb-2">
      <div className="flex flex-col gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s.id}
            onClick={() => accept({ suggestion: s, shouldSubmit: true })}
            disabled={isPending}
            className="w-full text-left px-3 py-2 text-xs rounded-lg bg-gradient-to-r from-wander-copper/8 to-wander-copper/4 border border-wander-copper/15 text-wander-cream/65 hover:from-wander-copper/15 hover:to-wander-copper/8 hover:text-wander-cream/90 hover:border-wander-copper/25 transition-all duration-200 disabled:opacity-50 line-clamp-1"
          >
            <span className="text-wander-copper-light/80 mr-1.5">&#8250;</span>
            {s.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Streaming Indicator ────────────────────────────────────

function StreamingIndicator() {
  const { isIdle, generationStatusMessage } = useTamboThread();
  if (isIdle) return null;

  return (
    <div className="flex items-center gap-2.5 px-4 py-2 mx-3 mb-1 rounded-lg bg-wander-copper/5 border border-wander-copper/10">
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-wander-copper-light/60 animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-1.5 h-1.5 rounded-full bg-wander-copper-light/60 animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-1.5 h-1.5 rounded-full bg-wander-copper-light/60 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-xs text-wander-copper-light/70">{generationStatusMessage || "Planning your trip..."}</span>
    </div>
  );
}

// ─── Narrow Conversation Mode ───────────────────────────────

function ConversationView({
  userThreads,
  persistThread,
  onSignOut,
  userEmail,
}: {
  userThreads: UserThread[];
  persistThread?: (id: string, title?: string) => Promise<void>;
  onSignOut: () => void;
  userEmail?: string;
}) {
  const { thread } = useTambo();
  const { isIdle, startNewThread, switchCurrentThread } = useTamboThread();
  const hasMessages = thread?.messages && thread.messages.length > 0;
  const lastPersistedRef = useRef<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Derive a title from the thread name or first user message
  const derivedTitle = thread?.name
    || thread?.messages?.find((m) => m.role === "user")?.content
        ?.toString()
        .slice(0, 60)
    || undefined;

  // Persist thread (and re-persist when title changes)
  useEffect(() => {
    if (!thread?.id || !hasMessages || !persistThread) return;
    const titleChanged = thread.id === lastPersistedRef.current;
    if (thread.id !== lastPersistedRef.current || titleChanged) {
      lastPersistedRef.current = thread.id;
      persistThread(thread.id, derivedTitle);
    }
  }, [thread?.id, hasMessages, persistThread, derivedTitle]);

  const handleLogoClick = () => {
    startNewThread();
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col h-full bg-wander-charcoal relative grain-overlay chat-dark-theme">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-wander-slate/10 bg-gradient-to-b from-wander-charcoal to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group"
            title="Back to home"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-wander-copper to-wander-copper-light flex items-center justify-center shadow-md shadow-wander-copper/15 group-hover:shadow-wander-copper/30 transition-shadow duration-300">
              <Compass className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
            </div>
            <span
              className="text-sm font-semibold text-wander-cream/80 tracking-tight group-hover:text-wander-cream transition-colors duration-200"
              style={{ fontFamily: "var(--font-display)" }}
            >
              WanderAI
            </span>
          </button>
          <div className="flex items-center gap-0.5">
            {userThreads.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                title="Chat history"
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  showHistory
                    ? "text-wander-copper-light bg-wander-copper/12 shadow-sm shadow-wander-copper/10"
                    : "text-wander-cream/25 hover:text-wander-cream/60 hover:bg-wander-slate/15"
                }`}
              >
                <History className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleLogoClick}
              title="New trip"
              className="p-1.5 rounded-lg text-wander-cream/25 hover:text-wander-copper-light hover:bg-wander-copper/8 transition-all duration-200"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onSignOut}
              title={userEmail || "Sign out"}
              className="p-1.5 rounded-lg text-wander-cream/25 hover:text-wander-cream/60 hover:bg-wander-slate/15 transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* History overlay */}
      {showHistory && (
        <div className="absolute inset-0 top-[49px] z-20 bg-wander-charcoal/[.97] backdrop-blur-md animate-fade-in">
          <div className="px-4 py-3 border-b border-wander-slate/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3.5 rounded-full bg-gradient-to-b from-wander-copper to-wander-copper-light/50" />
              <span className="text-xs font-medium text-wander-cream/50 uppercase tracking-wide">
                Previous Trips
              </span>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1 rounded-md text-wander-cream/25 hover:text-wander-cream/60 hover:bg-wander-slate/15 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-y-auto chat-scrollbar px-3 py-2 space-y-0.5" style={{ maxHeight: "calc(100% - 41px)" }}>
            {userThreads.map((t) => {
              const active = t.tambo_thread_id === thread?.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { switchCurrentThread(t.tambo_thread_id); setShowHistory(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between gap-2 ${
                    active
                      ? "bg-gradient-to-r from-wander-copper/12 to-wander-copper/5 text-wander-copper-light border border-wander-copper/15"
                      : "text-wander-cream/50 hover:bg-wander-slate/12 hover:text-wander-cream/80 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      active ? "bg-wander-copper-light" : "bg-wander-cream/15"
                    }`} />
                    <span className="text-sm truncate">
                      {t.title || "Untitled Trip"}
                    </span>
                  </div>
                  <span className="text-[10px] text-wander-cream/20 flex-shrink-0">
                    {formatRelativeDate(t.updated_at)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollableMessageContainer className="flex-1 px-4 py-4 chat-scrollbar">
          <ThreadContent variant="default">
            <ThreadContentMessages />
          </ThreadContent>
        </ScrollableMessageContainer>
        <StreamingIndicator />
        <SuggestionChips />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t border-wander-slate/10 bg-gradient-to-t from-wander-charcoal via-wander-charcoal to-transparent">
        <CompactInput />
      </div>
    </div>
  );
}

// ─── ChatPanel (switches between modes) ─────────────────────

interface ChatPanelProps {
  persistThread?: (id: string, title?: string) => Promise<void>;
  userThreads?: UserThread[];
  isExpanded?: boolean;
}

export function ChatPanel({
  persistThread,
  userThreads = [],
  isExpanded = false,
}: ChatPanelProps) {
  const { thread } = useTambo();
  const { setValue, submit } = useTamboThreadInput();
  const { switchCurrentThread } = useTamboThread();
  const { signOut, user } = useAuth();
  const hasMessages = thread?.messages && thread.messages.length > 0;

  const handleSelectPrompt = async (prompt: string) => {
    setValue(prompt);
    await submit({});
  };

  // Full-width welcome mode
  if (isExpanded && !hasMessages) {
    return (
      <div className="h-full bg-wander-charcoal grain-overlay chat-dark-theme">
        <ExpandedWelcome
          onSelectPrompt={handleSelectPrompt}
          userThreads={userThreads}
          onSelectThread={(id) => switchCurrentThread(id)}
          onSignOut={signOut}
          userEmail={user?.email || undefined}
        />
      </div>
    );
  }

  // Narrow conversation mode
  return (
    <ConversationView
      userThreads={userThreads}
      persistThread={persistThread}
      onSignOut={signOut}
      userEmail={user?.email || undefined}
    />
  );
}
