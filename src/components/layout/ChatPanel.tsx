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
import { Compass, Send, Loader2, Plus } from "lucide-react";

interface StarterPrompt {
  title: string;
  subtitle: string;
  prompt: string;
}

const starterPrompts: StarterPrompt[] = [
  {
    title: "Weekend in Paris",
    subtitle: "Romantic getaway for two",
    prompt: "Plan a weekend trip to Paris for two people",
  },
  {
    title: "7-Day Japan",
    subtitle: "On a $3000 budget",
    prompt: "Plan a 7-day trip to Japan on a $3000 budget",
  },
  {
    title: "Bangkok Food Tour",
    subtitle: "3 days of culinary adventure",
    prompt: "Plan a 3-day food tour in Bangkok",
  },
];

function WelcomeState({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-4">
      {/* Logo Mark */}
      <div className="relative mb-5 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-wander-copper to-wander-copper-light flex items-center justify-center shadow-lg shadow-wander-copper/20">
          <Compass className="w-6 h-6 text-white" strokeWidth={1.5} />
        </div>
        <div className="absolute -inset-1.5 rounded-2xl bg-wander-copper/10 blur-lg -z-10" />
      </div>

      {/* Welcome Text */}
      <div className="text-center mb-5 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <h2
          className="text-lg font-semibold text-wander-cream mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Where to next?
        </h2>
        <p className="text-wander-cream/60 text-xs max-w-[240px] leading-relaxed">
          Tell me about your dream trip and I&apos;ll craft a personalized itinerary.
        </p>
      </div>

      {/* Starter Prompts */}
      <div className="w-full max-w-xs space-y-2 stagger-children">
        {starterPrompts.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(item.prompt)}
            className="w-full group animate-fade-in-up opacity-0"
            style={{ animationDelay: `${200 + index * 100}ms`, animationFillMode: "forwards" }}
          >
            <div className="relative overflow-hidden rounded-lg bg-wander-slate/30 border border-wander-slate/20 px-3 py-2.5 text-left transition-all duration-300 hover:bg-wander-slate/40 hover:border-wander-copper/30">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-wander-cream font-medium text-sm leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-wander-cream/50 text-[11px] leading-tight">
                    {item.subtitle}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-md bg-wander-copper/10 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-wander-copper/20">
                  <Send className="w-3 h-3 text-wander-copper-light" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SuggestionChips() {
  const { suggestions, accept, isPending } = useTamboSuggestions({ maxSuggestions: 2 });
  const { isIdle } = useTamboThread();

  // Only show when we have suggestions and AI is idle
  if (!isIdle || suggestions.length === 0) return null;

  return (
    <div className="px-4 pb-3 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => accept({ suggestion, shouldSubmit: true })}
            disabled={isPending}
            className="group w-full text-left px-3 py-2.5 text-xs rounded-xl bg-gradient-to-r from-wander-copper/10 to-wander-copper/5 border border-wander-copper/20 text-wander-cream/80 hover:from-wander-copper/20 hover:to-wander-copper/10 hover:border-wander-copper/40 hover:text-wander-cream transition-all duration-200 disabled:opacity-50 line-clamp-2"
          >
            <span className="text-wander-copper-light mr-1.5">→</span>
            {suggestion.title}
          </button>
        ))}
      </div>
    </div>
  );
}

function StreamingIndicator() {
  const { isIdle, generationStatusMessage } = useTamboThread();

  if (isIdle) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-wander-copper-light animate-pulse">
      <Loader2 className="w-3.5 h-3.5 animate-spin" />
      <span>{generationStatusMessage || "Thinking..."}</span>
    </div>
  );
}

export function ChatPanel() {
  const { thread } = useTambo();
  const { setValue, submit } = useTamboThreadInput();
  const { isIdle, startNewThread } = useTamboThread();
  const hasMessages = thread?.messages && thread.messages.length > 0;

  const handleSelectPrompt = async (prompt: string) => {
    setValue(prompt);
    await submit({});
  };

  return (
    <div className="flex flex-col h-full bg-wander-charcoal relative grain-overlay chat-dark-theme">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-wander-slate/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-wander-copper to-wander-copper-light flex items-center justify-center">
              <Compass className="w-4.5 h-4.5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1
                className="text-lg font-semibold text-wander-cream tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                WanderAI
              </h1>
              <p className="text-[11px] text-wander-copper-light -mt-0.5 tracking-wide uppercase">
                Trip Planner
              </p>
            </div>
          </div>
          {hasMessages && (
            <button
              onClick={startNewThread}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-wander-slate/20 border border-wander-slate/30 text-wander-cream/70 hover:bg-wander-copper/20 hover:border-wander-copper/30 hover:text-wander-cream transition-all duration-200 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Trip</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {hasMessages ? (
          <>
            <ScrollableMessageContainer className="flex-1 px-4 py-4 chat-scrollbar">
              <ThreadContent variant="default">
                <ThreadContentMessages />
              </ThreadContent>
            </ScrollableMessageContainer>
            <StreamingIndicator />
            <SuggestionChips />
          </>
        ) : (
          <WelcomeState onSelectPrompt={handleSelectPrompt} />
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-wander-slate/20">
        <MessageInput
          variant="default"
          className="bg-wander-slate/20 border-wander-slate/30 rounded-xl hover:border-wander-copper/30 focus-within:border-wander-copper/50 focus-within:bg-wander-slate/30 transition-all duration-200"
        >
          <MessageInputTextarea
            placeholder="Describe your dream trip..."
            className="text-wander-cream placeholder:text-wander-slate/60 bg-transparent border-none resize-none min-h-[36px] py-2 px-4 text-left [&_.tiptap]:text-left"
          />
          <MessageInputToolbar className="px-2 pb-2">
            {!isIdle ? (
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-wander-copper-light">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              <MessageInputSubmitButton className="bg-wander-copper hover:bg-wander-copper-light text-white rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-wander-copper/20 disabled:opacity-40 disabled:cursor-not-allowed" />
            )}
          </MessageInputToolbar>
        </MessageInput>
      </div>
    </div>
  );
}
