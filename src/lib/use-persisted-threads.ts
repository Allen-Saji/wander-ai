"use client";

import { useAuth } from "@/lib/auth-context";
import {
  getUserThreads,
  saveUserThread,
  type UserThread,
} from "@/lib/supabase/chat-persistence";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook that syncs Tambo thread IDs with Supabase for per-user persistence.
 *
 * - On mount: loads the user's saved thread IDs
 * - Exposes `persistThread` to save new threads
 * - Exposes `userThreadIds` set to filter thread lists
 */
export function usePersistedThreads() {
  const { user } = useAuth();
  const [userThreads, setUserThreads] = useState<UserThread[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  // Load user's threads on mount
  useEffect(() => {
    if (!user || fetchedRef.current) return;
    fetchedRef.current = true;

    getUserThreads(user.id).then((threads) => {
      setUserThreads(threads);
      setLoading(false);
    });
  }, [user]);

  // Save a thread for the current user
  const persistThread = useCallback(
    async (tamboThreadId: string, title?: string) => {
      if (!user) return;
      const saved = await saveUserThread(user.id, tamboThreadId, title);
      if (saved) {
        setUserThreads((prev) => {
          // Replace if exists, otherwise prepend
          const existing = prev.findIndex(
            (t) => t.tambo_thread_id === tamboThreadId
          );
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = saved;
            return updated;
          }
          return [saved, ...prev];
        });
      }
    },
    [user]
  );

  // Set of Tambo thread IDs belonging to this user
  const userThreadIds = new Set(userThreads.map((t) => t.tambo_thread_id));

  return {
    userThreads,
    userThreadIds,
    persistThread,
    loading,
  };
}
